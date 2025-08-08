import { NextRequest, NextResponse } from 'next/server'

interface PriceDataPoint {
  timestamp: string
  price: number
  volume: number
  marketCap?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'
    const interval = searchParams.get('interval') || '1h'

    // Generate mock price data based on timeframe
    const generatePriceData = (hours: number, intervalMinutes: number): PriceDataPoint[] => {
      const data: PriceDataPoint[] = []
      const now = new Date()
      const basePrice = 0.0001 // Base price in USD
      
      for (let i = hours * 60; i >= 0; i -= intervalMinutes) {
        const timestamp = new Date(now.getTime() - i * 60 * 1000)
        
        // Generate realistic price movement with some volatility
        const timeProgress = (hours * 60 - i) / (hours * 60)
        const trend = Math.sin(timeProgress * Math.PI * 2) * 0.1 // Overall trend
        const volatility = (Math.random() - 0.5) * 0.05 // Random volatility
        const priceMultiplier = 1 + trend + volatility
        
        const price = basePrice * priceMultiplier
        const volume = Math.random() * 1000000 + 500000 // Random volume between 500K-1.5M
        const marketCap = price * 1000000000 // Assuming 1B total supply
        
        data.push({
          timestamp: timestamp.toISOString(),
          price: Math.max(price, 0.00001), // Ensure price doesn't go negative
          volume: Math.round(volume),
          marketCap: Math.round(marketCap)
        })
      }
      
      return data.reverse() // Return chronological order
    }

    let priceData: PriceDataPoint[]
    
    switch (timeframe) {
      case '1h':
        priceData = generatePriceData(1, 5) // 1 hour, 5-minute intervals
        break
      case '24h':
        priceData = generatePriceData(24, 60) // 24 hours, 1-hour intervals
        break
      case '7d':
        priceData = generatePriceData(24 * 7, 60 * 4) // 7 days, 4-hour intervals
        break
      case '30d':
        priceData = generatePriceData(24 * 30, 60 * 24) // 30 days, 1-day intervals
        break
      default:
        priceData = generatePriceData(24, 60) // Default to 24h
    }

    // Calculate additional metrics
    const currentPrice = priceData[priceData.length - 1]?.price || 0
    const previousPrice = priceData[0]?.price || 0
    const priceChange = currentPrice - previousPrice
    const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0
    
    const totalVolume = priceData.reduce((sum, point) => sum + point.volume, 0)
    const averageVolume = totalVolume / priceData.length
    
    const highPrice = Math.max(...priceData.map(p => p.price))
    const lowPrice = Math.min(...priceData.map(p => p.price))

    return NextResponse.json({
      success: true,
      data: {
        priceData,
        summary: {
          currentPrice,
          priceChange,
          priceChangePercent,
          highPrice,
          lowPrice,
          totalVolume,
          averageVolume,
          timeframe,
          interval
        }
      }
    })
  } catch (error) {
    console.error('Error fetching price data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price data' },
      { status: 500 }
    )
  }
}
