import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'CHONK9K Whale Manager API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      status: 'healthy'
    })
  } catch (error) {
    console.error('Ping endpoint error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Service unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}

export async function HEAD() {
  return new Response(null, { status: 200 })
}
