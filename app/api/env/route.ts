import { NextRequest, NextResponse } from 'next/server'

/**
 * Handles GET requests by returning a JSON response with public environment status information.
 *
 * The response includes the current environment, deployment context, presence of specific environment variables, and a timestamp.
 * No sensitive values are exposed; only boolean flags and environment names are returned.
 *
 * @returns A JSON response containing a `success` flag and an `environment` object with environment details.
 */
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
