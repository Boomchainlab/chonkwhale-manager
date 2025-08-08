import { printSafeConfig, validateEnv } from "../server/config"

try {
  validateEnv()
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(printSafeConfig(), null, 2))
} catch (err) {
  // eslint-disable-next-line no-console
  console.error("Config validation failed:", (err as Error).message)
  process.exit(1)
}
