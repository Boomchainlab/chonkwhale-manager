'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrophyIcon, ExternalLinkIcon } from 'lucide-react'

interface TopWhale {
  walletAddress: string
  balance: number
  usdValue: number
  knownEntity?: string
  tags: string[]
  rank: number
}

export function TopWhales() {
  const [whales, setWhales] = useState<TopWhale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopWhales = async () => {
      try {
        const response = await fetch('/api/top-whales')
        const data = await response.json()
        setWhales(data.whales || [])
      } catch (error) {
        console.error('Failed to fetch top whales:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopWhales()
    const interval = setInterval(fetchTopWhales, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(2)}M`
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(2)}K`
    }
    return balance.toFixed(2)
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <TrophyIcon className="h-4 w-4 text-yellow-400" />
    if (rank === 2) return <TrophyIcon className="h-4 w-4 text-gray-300" />
    if (rank === 3) return <TrophyIcon className="h-4 w-4 text-amber-600" />
    return <span className="text-sm font-bold text-gray-400">#{rank}</span>
  }

  const openSolscan = (address: string) => {
    window.open(`https://solscan.io/account/${address}`, '_blank')
  }

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Top Whales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <TrophyIcon className="h-5 w-5 text-yellow-400" />
          <span>Top Whales</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {whales.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No whale data available
            </div>
          ) : (
            whales.map((whale) => (
              <div
                key={whale.walletAddress}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => openSolscan(whale.walletAddress)}
              >
                <div className="flex items-center space-x-3">
                  {getRankIcon(whale.rank)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">
                        {formatAddress(whale.walletAddress)}
                      </span>
                      <ExternalLinkIcon className="h-3 w-3 text-gray-400" />
                    </div>
                    {whale.knownEntity && (
                      <div className="text-sm text-gray-400">{whale.knownEntity}</div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {whale.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-gray-600 text-gray-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {formatBalance(whale.balance)} CHONK
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatUSD(whale.usdValue)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
