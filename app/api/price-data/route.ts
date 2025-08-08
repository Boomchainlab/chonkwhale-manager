import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Generate mock price data for the last 24 hours
    const now = Date.now()
    const priceData = []
    const basePrice = 0.05 // $0.05 base price
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now - (i * 60 * 60 * 1000)) // Every hour
      const randomVariation = (Math.random() - 0.5) * 0.01 // ±$0.005 variation
      const price = basePrice + randomVariation
      
      priceData.push({
        timestamp: timestamp.toISOString(),
        price: Math.max(0.001, price), // Minimum price of $0.001
        volume: Math.floor(Math.random() * 1000000) + 500000 // Random volume between 500K-1.5M
      })
    }

    const currentPrice = priceData[priceData.length - 1].price
    const price24hAgo = priceData[0].price
    const priceChange24h = ((currentPrice - price24hAgo) / price24hAgo) * 100

    return NextResponse.json({
      success: true,
      priceData,
      currentPrice,
      priceChange24h
    })
  } catch (error) {
    console.error('Error fetching price data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price data' },
      { status: 500 }
    )
  }
}
