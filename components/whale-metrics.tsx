'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUpIcon, TrendingDownIcon, DollarSignIcon, ActivityIcon } from 'lucide-react'

interface WhaleMetrics {
  totalWhales: number
  totalVolume24h: number
  averageTransactionSize: number
  activeWhales24h: number
  volumeChange24h: number
  whaleChange24h: number
}

export function WhaleMetrics() {
  const [metrics, setMetrics] = useState<WhaleMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/whale-metrics')
        const data = await response.json()
        setMetrics(data.metrics)
      } catch (error) {
        console.error('Failed to fetch whale metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return num.toFixed(0)
  }

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Whales</p>
              <p className="text-2xl font-bold text-white">{formatNumber(metrics.totalWhales)}</p>
            </div>
            <div className="flex items-center space-x-1">
              {metrics.whaleChange24h >= 0 ? (
                <TrendingUpIcon className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDownIcon className="h-4 w-4 text-red-400" />
              )}
              <span className={`text-sm ${metrics.whaleChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(metrics.whaleChange24h)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">24h Volume</p>
              <p className="text-2xl font-bold text-white">{formatUSD(metrics.totalVolume24h)}</p>
            </div>
            <div className="flex items-center space-x-1">
              {metrics.volumeChange24h >= 0 ? (
                <TrendingUpIcon className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDownIcon className="h-4 w-4 text-red-400" />
              )}
              <span className={`text-sm ${metrics.volumeChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(metrics.volumeChange24h)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Avg Transaction</p>
              <p className="text-2xl font-bold text-white">{formatUSD(metrics.averageTransactionSize)}</p>
            </div>
            <DollarSignIcon className="h-8 w-8 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Whales</p>
              <p className="text-2xl font-bold text-white">{formatNumber(metrics.activeWhales24h)}</p>
            </div>
            <ActivityIcon className="h-8 w-8 text-purple-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
