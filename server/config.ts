/*
  Centralized environment configuration for server-only secrets.

  - Validates and normalizes all critical environment variables at startup.
  - Supports both DATABASE_URL and discrete PG* components.
  - Auto-falls back from STRIPE_SECRET_KEY to STRIPE_TEST_API_KEY if needed.
  - Provides a "safe" printable version of the config with secrets redacted.
*/

type LogLevel =
  | "error"
  | "warn"
  | "info"
  | "http"
  | "verbose"
  | "debug"
  | "silly"

function parseNumber(value: string | undefined, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value == null) return fallback
  return ["1", "true", "yes", "on"].includes(value.toLowerCase())
}

function parseCSV(value: string | undefined, fallback: string[] = []): string[] {
  if (!value) return fallback
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
}

function buildDatabaseUrlFromParts({
  user,
  password,
  host,
  port,
  database,
  sslmode = "require",
}: {
  user?: string
  password?: string
  host?: string
  port?: string
  database?: string
  sslmode?: "require" | "disable" | "prefer"
}) {
  if (!user || !password || !host || !port || !database) return undefined
  // Example: postgresql://user:pass@host:port/db?sslmode=require
  const encodedUser = encodeURIComponent(user)
  const encodedPass = encodeURIComponent(password)
  return `postgresql://${encodedUser}:${encodedPass}@${host}:${port}/${database}?sslmode=${sslmode}`
}

export type ServerEnv = {
  nodeEnv: "production" | "development" | "test"
  isProduction: boolean
  port: number

  // Security
  sessionSecret?: string

  // Database (Neon/Postgres)
  databaseUrl?: string
  pg: {
    host?: string
    port?: string
    user?: string
    password?: string
    database?: string
  }

  // Stripe
  stripeSecretKey?: string

  // CORS
  allowedOrigins: string[]

  // Logging
  logLevel: LogLevel

  // Feature flags
  enableMetrics: boolean
}

const nodeEnv = (process.env.NODE_ENV as ServerEnv["nodeEnv"]) ?? "development"
const isProduction = nodeEnv === "production"

const maybeDatabaseUrl =
  process.env.DATABASE_URL ||
  buildDatabaseUrlFromParts({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
  })

// Stripe: prefer STRIPE_SECRET_KEY; fall back to STRIPE_TEST_API_KEY
const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_API_KEY

export const config: ServerEnv = {
  nodeEnv,
  isProduction,
  port: parseNumber(process.env.PORT, 3000),

  sessionSecret: process.env.SESSION_SECRET,

  databaseUrl: maybeDatabaseUrl,
  pg: {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  },

  stripeSecretKey,

  allowedOrigins: parseCSV(process.env.ALLOWED_ORIGINS, [
    "http://localhost:3000",
    "http://localhost:5173",
  ]),

  logLevel: (process.env.LOG_LEVEL as LogLevel) ?? "info",

  enableMetrics: parseBoolean(process.env.ENABLE_METRICS, true),
}

export function validateEnv(): void {
  const problems: string[] = []

  // Strongly recommended for auth/session cookies
  if (!config.sessionSecret) {
    problems.push("SESSION_SECRET is missing.")
  }

  // Database is optional if not used, but if any PG* is present, make sure URL is built.
  const pgProvided =
    config.pg.host || config.pg.port || config.pg.user || config.pg.password || config.pg.database
  if (!config.databaseUrl && pgProvided) {
    problems.push("DATABASE_URL could not be constructed from PG* parts. Provide DATABASE_URL or complete PG* set.")
  }

  // Stripe secret key is optional unless payments are enabled
  // Warn if a likely secret is accidentally on client
  if (process.env.VITE_TEST_API_KEY?.startsWith("sk_")) {
    problems.push(
      "VITE_TEST_API_KEY appears to be a Stripe secret key (sk_...). Never expose secret keys in client env. Use STRIPE_SECRET_KEY on the server and pk_* publishable key on the client."
    )
  }

  if (problems.length > 0) {
    const message = "Environment validation warnings/errors:\n- " + problems.join("\n- ")
    if (config.isProduction) {
      // Fail fast in production
      throw new Error(message)
    } else {
      // eslint-disable-next-line no-console
      console.warn(message)
    }
  }
}

export function printSafeConfig() {
  return {
    nodeEnv: config.nodeEnv,
    isProduction: config.isProduction,
    port: config.port,
    sessionSecret: config.sessionSecret ? "[REDACTED]" : undefined,
    databaseUrl: config.databaseUrl ? "[REDACTED]" : undefined,
    pg: {
      host: config.pg.host,
      port: config.pg.port,
      user: config.pg.user,
      password: config.pg.password ? "[REDACTED]" : undefined,
      database: config.pg.database,
    },
    stripeSecretKey: config.stripeSecretKey ? "[REDACTED]" : undefined,
    allowedOrigins: config.allowedOrigins,
    logLevel: config.logLevel,
    enableMetrics: config.enableMetrics,
  }
}
