import { NextRequest, NextResponse } from 'next/server'

interface PriceData {
  timestamp: string
  price: number
  volume: number
  marketCap: number
  change24h: number
}

const generatePriceHistory = (hours: number = 24): PriceData[] => {
  const data: PriceData[] = []
  const now = new Date()
  const basePrice = 0.0001
  const totalSupply = 1000000000 // 1B tokens
  
  let currentPrice = basePrice
  
  for (let i = hours - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
    
    // Add some realistic price movement
    const volatility = 0.02 // 2% volatility
    const trend = Math.sin(i * 0.1) * 0.001 // Slight trend
    const randomChange = (Math.random() - 0.5) * volatility * basePrice
    
    currentPrice = Math.max(0.00005, basePrice + trend + randomChange)
    
    const volume = Math.random() * 2000000 + 500000 // Random volume between 500K-2.5M
    const marketCap = currentPrice * totalSupply
    
    data.push({
      timestamp: timestamp.toISOString(),
      price: currentPrice,
      volume,
      marketCap,
      change24h: 0 // Will calculate later
    })
  }
  
  // Calculate 24h change for each point
  if (data.length > 0) {
    const firstPrice = data[0].price
    data.forEach(point => {
      point.change24h = ((point.price - firstPrice) / firstPrice) * 100
    })
  }
  
  return data
}

/**
 * Handles GET requests to generate and return simulated cryptocurrency price data and statistics for a specified timeframe.
 *
 * Parses the `timeframe` query parameter to determine the historical range, generates mock price data, computes summary statistics, and returns the results as a JSON response. On error, returns a JSON response with an error message and a 500 status code.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'
    
    let hours = 24
    switch (timeframe) {
      case '1h':
        hours = 1
        break
      case '7d':
        hours = 168
        break
      case '30d':
        hours = 720
        break
      default:
        hours = 24
    }
    
    const priceData = generatePriceHistory(hours)
    const currentPrice = priceData[priceData.length - 1]
    const previousPrice = priceData[0]
    
    const stats = {
      currentPrice: currentPrice.price,
      priceChange24h: ((currentPrice.price - previousPrice.price) / previousPrice.price) * 100,
      volume24h: priceData.reduce((sum, point) => sum + point.volume, 0),
      marketCap: currentPrice.marketCap,
      high24h: Math.max(...priceData.map(p => p.price)),
      low24h: Math.min(...priceData.map(p => p.price))
    }

    return NextResponse.json({
      success: true,
      priceData,
      stats,
      timeframe,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching price data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price data' },
      { status: 500 }
    )
  }
}
