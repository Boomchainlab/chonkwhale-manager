'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, BarChart3 } from 'lucide-react'

interface PriceData {
  time: string
  price: number
  volume: number
}

export function PriceChart() {
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [currentPrice, setCurrentPrice] = useState(0.00012)

  useEffect(() => {
    // Generate mock price data for the last 24 hours
    const generatePriceData = () => {
      const data: PriceData[] = []
      const now = new Date()
      let price = 0.00012

      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        price += (Math.random() - 0.5) * 0.000005
        price = Math.max(0.00008, Math.min(0.00020, price))
        
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          price: Number(price.toFixed(6)),
          volume: Math.floor(Math.random() * 1000000 + 500000)
        })
      }

      return data
    }

    const initialData = generatePriceData()
    setPriceData(initialData)
    setCurrentPrice(initialData[initialData.length - 1].price)

    // Update price every 5 seconds
    const interval = setInterval(() => {
      setPriceData(prev => {
        const newData = [...prev]
        const lastPrice = newData[newData.length - 1].price
        const newPrice = lastPrice + (Math.random() - 0.5) * 0.000002
        const clampedPrice = Math.max(0.00008, Math.min(0.00020, newPrice))
        
        newData.push({
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          price: Number(clampedPrice.toFixed(6)),
          volume: Math.floor(Math.random() * 1000000 + 500000)
        })

        // Keep only last 24 data points
        if (newData.length > 24) {
          newData.shift()
        }

        setCurrentPrice(clampedPrice)
        return newData
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const priceChange = priceData.length > 1 
    ? ((currentPrice - priceData[0].price) / priceData[0].price) * 100
    : 0

  const formatPrice = (price: number) => {
    return `$${price.toFixed(6)}`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toString()
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              CHONK9K Price Chart
            </CardTitle>
            <CardDescription>
              24-hour price movement and volume
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {formatPrice(currentPrice)}
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              priceChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <TrendingUp className={`h-3 w-3 ${priceChange < 0 ? 'rotate-180' : ''}`} />
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}% (24h)
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={formatPrice}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number, name: string) => [
                  name === 'price' ? formatPrice(value) : formatVolume(value),
                  name === 'price' ? 'Price' : 'Volume'
                ]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#8B5CF6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
