/**
 * Client-safe environment helper for Vite.
 * Only VITE_* variables are exposed to the browser.
 */
type ClientEnv = {
  VITE_EMAIL_ADDRESS?: string;
  VITE_MINT_TOKEN_ADDRESS?: string;
  VITE_PUBLISHABLE_KEY?: string; // Stripe publishable key (pk_...)
};

const rawEnv = import.meta.env as unknown as ClientEnv;

export const ENV = {
  VITE_EMAIL_ADDRESS: rawEnv.VITE_EMAIL_ADDRESS ?? "",
  VITE_MINT_TOKEN_ADDRESS: rawEnv.VITE_MINT_TOKEN_ADDRESS ?? "",
  VITE_PUBLISHABLE_KEY: rawEnv.VITE_PUBLISHABLE_KEY ?? "",
};

export function getStripePublishableKey(): string {
  return ENV.VITE_PUBLISHABLE_KEY || "";
}
