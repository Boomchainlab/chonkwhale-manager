'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, BarChart3 } from 'lucide-react'

interface MetricData {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
}

export function WhaleMetrics() {
  const [metrics, setMetrics] = useState<MetricData[]>([])

  useEffect(() => {
    // Mock real-time metrics
    const updateMetrics = () => {
      const newMetrics: MetricData[] = [
        {
          label: 'Total Whale Volume (24h)',
          value: `$${(Math.random() * 500000 + 1000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
          change: `${(Math.random() * 20 - 10).toFixed(1)}%`,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          icon: <DollarSign className="h-4 w-4" />
        },
        {
          label: 'Active Whales',
          value: Math.floor(Math.random() * 50 + 150).toString(),
          change: `${(Math.random() * 10 - 5).toFixed(1)}%`,
          trend: Math.random() > 0.4 ? 'up' : 'down',
          icon: <Users className="h-4 w-4" />
        },
        {
          label: 'Whale Transactions',
          value: Math.floor(Math.random() * 100 + 500).toString(),
          change: `${(Math.random() * 15 - 7.5).toFixed(1)}%`,
          trend: Math.random() > 0.3 ? 'up' : 'down',
          icon: <Activity className="h-4 w-4" />
        },
        {
          label: 'Average Transaction',
          value: `${(Math.random() * 500 + 250).toFixed(0)}K CHONK9K`,
          change: `${(Math.random() * 25 - 12.5).toFixed(1)}%`,
          trend: Math.random() > 0.6 ? 'up' : 'down',
          icon: <BarChart3 className="h-4 w-4" />
        }
      ]
      setMetrics(newMetrics)
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              {metric.label}
            </CardTitle>
            <div className="text-gray-400">
              {metric.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {metric.value}
            </div>
            <div className="flex items-center text-xs">
              {metric.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
              ) : metric.trend === 'down' ? (
                <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
              ) : null}
              <span className={
                metric.trend === 'up' 
                  ? 'text-green-400' 
                  : metric.trend === 'down' 
                    ? 'text-red-400' 
                    : 'text-gray-400'
              }>
                {metric.change} from last hour
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
