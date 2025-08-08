import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Only return safe, public environment variables
    const publicEnv = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_REOWN_PROJECT_ID: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
      NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
      NEXT_PUBLIC_EMAIL_ADDRESS: process.env.NEXT_PUBLIC_EMAIL_ADDRESS,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      // Add deployment info
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_REGION: process.env.VERCEL_REGION
    }

    // Filter out undefined values
    const filteredEnv = Object.fromEntries(
      Object.entries(publicEnv).filter(([_, value]) => value !== undefined)
    )

    return NextResponse.json({
      success: true,
      environment: filteredEnv,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Environment endpoint error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch environment variables' },
      { status: 500 }
    )
  }
}
