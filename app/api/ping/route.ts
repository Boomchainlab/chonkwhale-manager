import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "CHONK9K Whale Manager API is running",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    status: "healthy"
  })
}
