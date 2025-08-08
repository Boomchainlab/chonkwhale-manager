import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // In production, these would be calculated from real blockchain data
    const mockMetrics = {
      totalWhales: 1247,
      totalVolume24h: 12500000,
      averageTransactionSize: 85000,
      activeWhales24h: 342,
      volumeChange24h: 15.7,
      whaleChange24h: 8.3
    }

    return NextResponse.json({
      success: true,
      metrics: mockMetrics
    })
  } catch (error) {
    console.error('Error fetching whale metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch whale metrics' },
      { status: 500 }
    )
  }
}
