import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'CHONK9K Whale Manager API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      success: true,
      message: 'Pong!',
      echo: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      message: 'Pong! (no body)',
      timestamp: new Date().toISOString()
    })
  }
}
