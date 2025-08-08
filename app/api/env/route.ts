import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Only return safe, public environment information
  const envInfo = {
    nodeEnv: process.env.NODE_ENV || 'development',
    vercelEnv: process.env.VERCEL_ENV || 'development',
    hasReownProjectId: !!process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
    hasStripeKeys: !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasSessionSecret: !!process.env.SESSION_SECRET,
    timestamp: new Date().toISOString()
  }

  return NextResponse.json({
    success: true,
    environment: envInfo
  })
}
