import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { Connection } from "@solana/web3.js"

export async function GET() {
  const timestamp = new Date().toISOString()
  const checks = {
    database: { status: 'unknown', message: '' },
    solana: { status: 'unknown', message: '' },
    stripe: { status: 'unknown', message: '' }
  }

  // Database check
  try {
    const url = process.env.DATABASE_URL
    if (!url) {
      checks.database = { status: 'not-configured', message: 'DATABASE_URL not set' }
    } else {
      const sql = neon(url)
      await sql`SELECT 1 as test`
      checks.database = { status: 'ok', message: 'Database connection successful' }
    }
  } catch (error) {
    checks.database = { 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Database connection failed' 
    }
  }

  // Solana RPC check
  try {
    const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"
    const connection = new Connection(rpcUrl)
    const slot = await connection.getSlot()
    checks.solana = { status: 'ok', message: `Connected to Solana, current slot: ${slot}` }
  } catch (error) {
    checks.solana = { 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Solana RPC connection failed' 
    }
  }

  // Stripe check
  const hasStripeSecret = !!(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_API_KEY)
  const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET
  
  if (!hasStripeSecret) {
    checks.stripe = { status: 'not-configured', message: 'Stripe secret key not set' }
  } else if (!hasWebhookSecret) {
    checks.stripe = { status: 'partial', message: 'Stripe configured but webhook secret missing' }
  } else {
    checks.stripe = { status: 'ok', message: 'Stripe fully configured' }
  }

  // Overall status
  const hasErrors = Object.values(checks).some(check => check.status === 'error')
  const overallStatus = hasErrors ? 'not-ready' : 'ready'

  const response = {
    status: overallStatus,
    timestamp,
    checks,
    environment: process.env.NODE_ENV || 'development'
  }

  return NextResponse.json(response, { 
    status: hasErrors ? 503 : 200 
  })
}

export async function HEAD() {
  try {
    const url = process.env.DATABASE_URL
    if (url) {
      const sql = neon(url)
      await sql`SELECT 1`
    }
    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
