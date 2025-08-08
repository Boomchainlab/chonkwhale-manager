import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // This is a server-side only endpoint that can safely access sensitive env vars
    const tokenInfo = {
      mintAddress: process.env.NEXT_PUBLIC_MINT_TOKEN_ADDRESS || process.env.CHONK9K_MINT_ADDRESS,
      symbol: 'CHONK9K',
      name: 'CHONKPUMP 9000',
      decimals: 6
    }

    return NextResponse.json({
      success: true,
      token: tokenInfo,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Token info endpoint error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch token information' },
      { status: 500 }
    )
  }
}
