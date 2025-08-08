import ms from "ms";

function parseNumber(value: string | undefined, fallback: number): number {
  const n = value ? Number(value) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function parseMs(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const asNum = Number(value);
  if (Number.isFinite(asNum)) return asNum;
  const parsed = ms(value);
  return typeof parsed === "number" ? parsed : fallback;
}

function parseCsv(value: string | undefined): string[] {
  return value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseNumber(process.env.PORT, 5000),

  // Auth / Sessions
  sessionSecret: process.env.SESSION_SECRET,
  replitDomains: parseCsv(process.env.REPLIT_DOMAINS),
  replId: process.env.REPL_ID,
  issuerUrl: process.env.ISSUER_URL || "https://replit.com/oidc",

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Blockchain / Token
  solanaRpcUrl:
    process.env.SOLANA_RPC_URL || "https://solana-mainnet.g.alchemy.com/v2/demo",
  chonkMintAddress:
    process.env.CHONK9K_MINT_ADDRESS ||
    "DnUsQnwNot38V9JbisNC18VHZkae1eKK5N2Dgy55pump",
  whaleThreshold: parseNumber(process.env.WHALE_THRESHOLD, 100000),

  // API Protection
  rateLimitWindowMs: parseMs(process.env.RATE_LIMIT_WINDOW_MS, ms("5m")),
  rateLimitMax: parseNumber(process.env.RATE_LIMIT_MAX, 600),

  // CORS
  corsAllowedOrigins: parseCsv(process.env.ALLOWED_ORIGINS),
} as const;
