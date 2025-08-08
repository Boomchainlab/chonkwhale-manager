'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, DollarSign, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MetricData {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  description: string
}

export function WhaleMetrics() {
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockMetrics: MetricData[] = [
        {
          title: 'Total Whale Volume',
          value: '$12.4M',
          change: '+8.2%',
          changeType: 'positive',
          icon: <DollarSign className="w-4 h-4" />,
          description: '24h whale transaction volume'
        },
        {
          title: 'Active Whales',
          value: '247',
          change: '+12',
          changeType: 'positive',
          icon: <Users className="w-4 h-4" />,
          description: 'Unique whale wallets active today'
        },
        {
          title: 'Whale Transactions',
          value: '1,834',
          change: '-3.1%',
          changeType: 'negative',
          icon: <Activity className="w-4 h-4" />,
          description: 'Large transactions (≥$50K) in 24h'
        },
        {
          title: 'Buy/Sell Ratio',
          value: '1.34',
          change: '+0.12',
          changeType: 'positive',
          icon: <TrendingUp className="w-4 h-4" />,
          description: 'Whale buy vs sell pressure'
        }
      ]
      
      setMetrics(mockMetrics)
      setIsLoading(false)
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="w-4 h-4 bg-gray-600 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-600 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="w-20 h-8 bg-gray-600 rounded animate-pulse mb-2" />
              <div className="w-16 h-4 bg-gray-600 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              {metric.title}
            </CardTitle>
            <div className="text-gray-400">
              {metric.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold text-white">
                {metric.value}
              </div>
              <div className={`text-sm font-medium flex items-center ${
                metric.changeType === 'positive' 
                  ? 'text-green-400' 
                  : metric.changeType === 'negative'
                  ? 'text-red-400'
                  : 'text-gray-400'
              }`}>
                {metric.changeType === 'positive' && <TrendingUp className="w-3 h-3 mr-1" />}
                {metric.changeType === 'negative' && <TrendingDown className="w-3 h-3 mr-1" />}
                {metric.change}
              </div>
            </div>
            <CardDescription className="text-xs text-gray-500 mt-1">
              {metric.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
