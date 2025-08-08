/**
 * Centralized, typed configuration and basic validation.
 * Do not hardcode secrets; read from process.env (set via host UI).
 */
export type AppConfig = {
  nodeEnv: string;
  isProduction: boolean;
  port: number;

  // Secrets (server-only)
  sessionSecret?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;

  // Database
  databaseUrl?: string;

  // CORS / Allowed origins (CSV)
  allowedOrigins: string[];
};

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  port: parseNumber(process.env.PORT, 5000),

  sessionSecret: process.env.SESSION_SECRET,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_API_KEY, // prefer STRIPE_SECRET_KEY
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

  databaseUrl: process.env.DATABASE_URL,

  allowedOrigins: parseCsv(process.env.ALLOWED_ORIGINS),
};

export function validateEnv() {
  const errs: string[] = [];
  if (!config.sessionSecret) errs.push("SESSION_SECRET is required.");
  // Stripe is optional unless using checkout/webhooks:
  // If you plan to use Stripe, uncomment:
  // if (!config.stripeSecretKey) errs.push("STRIPE_SECRET_KEY is required for Stripe Checkout.");
  // if (!config.stripeWebhookSecret) errs.push("STRIPE_WEBHOOK_SECRET is required for Stripe webhooks.");

  if (errs.length > 0) {
    const err = new Error(`Invalid environment: ${errs.join(" ")}`);
    (err as any).status = 500;
    throw err;
  }
}

export function printSafeConfig() {
  return {
    nodeEnv: config.nodeEnv,
    isProduction: config.isProduction,
    port: config.port,
    hasSessionSecret: !!config.sessionSecret,
    hasStripeSecretKey: !!config.stripeSecretKey,
    hasStripeWebhookSecret: !!config.stripeWebhookSecret,
    hasDatabaseUrl: !!config.databaseUrl,
    allowedOrigins: config.allowedOrigins,
  };
}
