import { config, validateEnv, printSafeConfig } from "./config";
import { validateEnv, printSafeConfig } from "./config";

// Validate environment and print safe config in development
try {
  validateEnv();
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("Server config (safe):", printSafeConfig());
  }
} catch (err) {
  // Fail fast in production
  // eslint-disable-next-line no-console
  console.error("Environment validation failed:", (err as Error).message);
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log("Server configuration (safe):", printSafeConfig());

// Placeholder for app/server initialization
// ** rest of code here **
