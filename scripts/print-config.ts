import { config, validateEnv, printSafeConfig } from "../server/config"
import { neon } from "@neondatabase/serverless"

async function main() {
  try {
    validateEnv()
  } catch (err) {
    console.error("Environment validation failed:")
    console.error(String(err))
    process.exit(1)
  }

  console.log("Safe config:", JSON.stringify(printSafeConfig(), null, 2))

  if (config.databaseUrl) {
    try {
      const sql = neon(config.databaseUrl)
      const result = await sql<{ now: string }>("select now()")
      console.log("DB connection OK. Now:", result[0]?.now)
    } catch (e) {
      console.error("DB connection failed:", e)
    }
  } else {
    console.warn("No DATABASE_URL configured; skipping DB check.")
  }

  if (config.stripeSecretKey) {
    console.log("Stripe key present (redacted).")
  } else {
    console.log("Stripe key not set. Payments disabled.")
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
