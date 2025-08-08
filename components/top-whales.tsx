'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react'
import { useState, useEffect } from 'react'

interface WhaleData {
  rank: number
  wallet: string
  balance: number
  balanceUSD: number
  change24h: number
  transactions24h: number
  label?: string
}

export function TopWhales() {
  const [whales, setWhales] = useState<WhaleData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWhales = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockWhales: WhaleData[] = [
        {
          rank: 1,
          wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          balance: 45000000,
          balanceUSD: 4500000,
          change24h: 8.5,
          transactions24h: 12,
          label: 'Binance Hot Wallet'
        },
        {
          rank: 2,
          wallet: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7Ybd4dfsEKvn',
          balance: 32000000,
          balanceUSD: 3200000,
          change24h: -2.3,
          transactions24h: 8
        },
        {
          rank: 3,
          wallet: 'EQuz4ybZaZbsGGckg2wVqzHBwlvFgvctdvQDiDJRKYmq',
          balance: 28500000,
          balanceUSD: 2850000,
          change24h: 15.2,
          transactions24h: 24,
          label: 'DeFi Protocol'
        },
        {
          rank: 4,
          wallet: 'FVwqJBjdxgKsQqZpVMdqGNq1wHjKjHgFdSaAsSdFgHjK',
          balance: 21000000,
          balanceUSD: 2100000,
          change24h: -5.7,
          transactions24h: 6
        },
        {
          rank: 5,
          wallet: 'GWxrJCkexhLtRrZqWNeqHOr2xIkKkIhGeSbBtTeFhIkL',
          balance: 18750000,
          balanceUSD: 1875000,
          change24h: 3.1,
          transactions24h: 15
        },
        {
          rank: 6,
          wallet: 'HXyrKDlexiMsStQrZrZsWOq3yJlKlIjHfTcCuTgGiJlM',
          balance: 16200000,
          balanceUSD: 1620000,
          change24h: -1.8,
          transactions24h: 4
        },
        {
          rank: 7,
          wallet: 'IYzsLEmfyNtUrSsZsXPq4zKmMjLmNkJkGfUdDvHhKlMn',
          balance: 14800000,
          balanceUSD: 1480000,
          change24h: 7.9,
          transactions24h: 19
        },
        {
          rank: 8,
          wallet: 'JZAtMFogzOuVtTsZtYQr5LnNnLnOoKkHgGvEeIiJlMnO',
          balance: 13500000,
          balanceUSD: 1350000,
          change24h: -3.4,
          transactions24h: 7
        }
      ]
      
      setWhales(mockWhales)
      setIsLoading(false)
    }

    fetchWhales()
    const interval = setInterval(fetchWhales, 120000) // Update every 2 minutes
    return () => clearInterval(interval)
  }, [])

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(balance)
  }

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
  }

  const getWalletInitials = (wallet: string) => {
    return wallet.slice(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Top Whales</CardTitle>
          <CardDescription className="text-gray-400">Loading whale data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-lg bg-gray-900/50">
                <div className="w-10 h-10 bg-gray-600 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 bg-gray-600 rounded animate-pulse" />
                  <div className="w-24 h-3 bg-gray-600 rounded animate-pulse" />
                </div>
                <div className="w-20 h-4 bg-gray-600 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Top CHONK Whales</CardTitle>
        <CardDescription className="text-gray-400">
          Largest token holders ranked by balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {whales.map((whale) => (
            <div
              key={whale.wallet}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-400 w-6">
                    #{whale.rank}
                  </span>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                      {getWalletInitials(whale.wallet)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">
                      {formatWallet(whale.wallet)}
                    </span>
                    {whale.label && (
                      <Badge variant="secondary" className="text-xs">
                        {whale.label}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{formatBalance(whale.balance)} CHONK</span>
                    <span>•</span>
                    <span>{formatUSD(whale.balanceUSD)}</span>
                    <span>•</span>
                    <span>{whale.transactions24h} txns</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`flex items-center text-sm font-medium ${
                  whale.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {whale.change24h >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {whale.change24h >= 0 ? '+' : ''}{whale.change24h.toFixed(1)}%
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => window.open(`https://solscan.io/account/${whale.wallet}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
