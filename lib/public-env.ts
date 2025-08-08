/**
 * Client-safe environment helper for Next.js.
 * Only NEXT_PUBLIC_* variables are exposed to the browser.
 */
export function getPublicConfig() {
  return {
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    emailAddress: process.env.NEXT_PUBLIC_EMAIL_ADDRESS || "",
  }
}

export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
}
