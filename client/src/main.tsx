/import { ENV } from "@/lib/env"

if (import.meta.env?.DEV) {
  // eslint-disable-next-line no-console
  console.log("Client env loaded:", {
    email: ENV.VITE_EMAIL_ADDRESS,
    mint: ENV.VITE_MINT_TOKEN_ADDRESS,
    publishableKey: ENV.VITE_PUBLISHABLE_KEY ? "[SET]" : "[NOT SET]",
  })
}

//** rest of code here **/
