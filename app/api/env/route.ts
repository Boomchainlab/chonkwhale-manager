import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasStripeSecret: !!(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_API_KEY),
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasSolanaRpc: !!process.env.SOLANA_RPC_URL,
    publicEnv: {
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_EMAIL_ADDRESS: process.env.NEXT_PUBLIC_EMAIL_ADDRESS,
      NEXT_PUBLIC_MINT_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_MINT_TOKEN_ADDRESS,
      NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL
    },
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}
