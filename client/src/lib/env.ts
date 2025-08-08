/*
  Client-only env accessor for Vite-built frontend.
  Only VITE_* variables are available on the client. Never put secrets (sk_...) here.
*/

type ClientEnv = {
  VITE_EMAIL_ADDRESS?: string
  VITE_MINT_TOKEN_ADDRESS?: string
  // Use a publishable key (pk_test_...) for Stripe on the client.
  VITE_PUBLISHABLE_KEY?: string
}

function readClientEnv(): ClientEnv {
  // eslint-disable-next-line no-undef
  const env = import.meta.env as Record<string, string | boolean | undefined>
  const publishable =
    (env.VITE_PUBLISHABLE_KEY as string) ||
    (env.VITE_TEST_API_KEY as string) || // legacy name; must be pk_* if used
    undefined

  if (publishable && publishable.startsWith("sk_")) {
    // eslint-disable-next-line no-console
    console.error(
      "VITE_PUBLISHABLE_KEY (or VITE_TEST_API_KEY) contains a secret key (sk_*). Move it to server-side STRIPE_SECRET_KEY and use a pk_* publishable key on the client."
    )
  }

  return {
    VITE_EMAIL_ADDRESS: (env.VITE_EMAIL_ADDRESS as string) || undefined,
    VITE_MINT_TOKEN_ADDRESS: (env.VITE_MINT_TOKEN_ADDRESS as string) || undefined,
    VITE_PUBLISHABLE_KEY: publishable,
  }
}

export const ENV = readClientEnv()
