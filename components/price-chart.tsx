'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState, useEffect } from 'react'

interface PriceData {
  timestamp: string
  price: number
  volume: number
}

interface PriceStats {
  currentPrice: number
  change24h: number
  changePercent24h: number
  volume24h: number
  marketCap: number
  high24h: number
  low24h: number
}

/**
 * Displays a real-time price chart and key statistics for the CHONK token using mock data.
 *
 * Shows current price, 24-hour volume, market capitalization, and 24-hour price range, along with a selectable timeframe and a responsive line chart. Data is refreshed every minute and updates when the selected timeframe changes.
 */
export function PriceChart() {
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [stats, setStats] = useState<PriceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D'>('24H')

  const fetchPriceData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate mock price data
    const now = new Date()
    const mockData: PriceData[] = []
    const basePrice = 0.1
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
      const randomChange = (Math.random() - 0.5) * 0.02
      const price = basePrice + randomChange + Math.sin(i * 0.5) * 0.01
      const volume = Math.random() * 1000000 + 500000
      
      mockData.push({
        timestamp: timestamp.toISOString(),
        price: Math.max(0.05, price),
        volume
      })
    }
    
    const currentPrice = mockData[mockData.length - 1].price
    const previousPrice = mockData[0].price
    const change24h = currentPrice - previousPrice
    const changePercent24h = (change24h / previousPrice) * 100
    
    const mockStats: PriceStats = {
      currentPrice,
      change24h,
      changePercent24h,
      volume24h: mockData.reduce((sum, item) => sum + item.volume, 0),
      marketCap: currentPrice * 1000000000, // Assuming 1B total supply
      high24h: Math.max(...mockData.map(d => d.price)),
      low24h: Math.min(...mockData.map(d => d.price))
    }
    
    setPriceData(mockData)
    setStats(mockStats)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchPriceData()
    const interval = setInterval(fetchPriceData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [timeframe])

  const formatPrice = (price: number) => {
    return `$${price.toFixed(4)}`
  }

  const formatVolume = (volume: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(volume)
  }

  const formatMarketCap = (marketCap: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(marketCap)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading || !stats) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">CHONK Price Chart</CardTitle>
          <CardDescription className="text-gray-400">Loading price data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              CHONK Price Chart
              <Badge variant={stats.changePercent24h >= 0 ? 'default' : 'destructive'} className="ml-2">
                {stats.changePercent24h >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {stats.changePercent24h >= 0 ? '+' : ''}{stats.changePercent24h.toFixed(2)}%
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Real-time CHONK token price and volume
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {(['1H', '24H', '7D', '30D'] as const).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className="text-xs"
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Price Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-400">Current Price</p>
            <p className="text-lg font-bold text-white">{formatPrice(stats.currentPrice)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">24h Volume</p>
            <p className="text-lg font-bold text-white">{formatVolume(stats.volume24h)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Market Cap</p>
            <p className="text-lg font-bold text-white">{formatMarketCap(stats.marketCap)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">24h Range</p>
            <p className="text-sm text-white">
              {formatPrice(stats.low24h)} - {formatPrice(stats.high24h)}
            </p>
          </div>
        </div>

        {/* Price Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp"
                tickFormatter={formatTime}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={formatPrice}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                labelFormatter={(label) => `Time: ${formatTime(label)}`}
                formatter={(value: number) => [formatPrice(value), 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={stats.changePercent24h >= 0 ? '#10B981' : '#EF4444'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: stats.changePercent24h >= 0 ? '#10B981' : '#EF4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
