import { NextRequest, NextResponse } from 'next/server'

interface WhaleMetrics {
  totalWhales: number
  totalVolume24h: number
  averageTransactionSize: number
  activeWhales24h: number
  volumeChange24h: number
  whaleChange24h: number
  largestTransaction24h: number
  buyVsSellRatio: number
}

/**
 * Handles GET requests by generating and returning randomized whale metrics data as a JSON response.
 *
 * The response includes metrics such as total whales, 24-hour volume, average transaction size, active whales, volume and whale count changes, largest transaction, buy vs sell ratio, and a timestamp. Returns a failure response with status 500 if an error occurs.
 */
export async function GET(request: NextRequest) {
  try {
    // Generate realistic mock metrics
    const baseVolume = 12400000
    const volumeVariation = (Math.random() - 0.5) * 2000000
    const totalVolume24h = Math.max(5000000, baseVolume + volumeVariation)
    
    const baseWhales = 247
    const whaleVariation = Math.floor((Math.random() - 0.5) * 50)
    const totalWhales = Math.max(150, baseWhales + whaleVariation)
    
    const metrics: WhaleMetrics = {
      totalWhales,
      totalVolume24h,
      averageTransactionSize: totalVolume24h / (Math.random() * 500 + 1000),
      activeWhales24h: Math.floor(totalWhales * (0.6 + Math.random() * 0.3)),
      volumeChange24h: (Math.random() - 0.5) * 30,
      whaleChange24h: (Math.random() - 0.5) * 20,
      largestTransaction24h: Math.random() * 2000000 + 500000,
      buyVsSellRatio: 0.8 + Math.random() * 0.8
    }

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching whale metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch whale metrics' },
      { status: 500 }
    )
  }
}
