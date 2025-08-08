import { NextRequest, NextResponse } from 'next/server'

/**
 * Handles GET requests to the API health check endpoint.
 *
 * Returns a JSON response indicating the API is operational, including a success flag, a status message, the current timestamp, and the API version.
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'CHONK9K Whale Manager API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
}

/**
 * Handles HTTP POST requests by responding with a JSON object containing a success flag, a message, the current timestamp, and, if present, the parsed request body.
 *
 * If the request body contains valid JSON, the response echoes the parsed body. If parsing fails or no body is provided, the response omits the echo field and adjusts the message accordingly.
 */
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
