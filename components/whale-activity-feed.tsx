'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

interface WhaleTransaction {
  id: string
  type: 'buy' | 'sell'
  amount: number
  token: string
  wallet: string
  timestamp: Date
  txHash: string
  usdValue: number
}

export function WhaleActivityFeed() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchTransactions = async () => {
    setIsLoading(true)
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockTransactions: WhaleTransaction[] = [
      {
        id: '1',
        type: 'buy',
        amount: 1250000,
        token: 'CHONK',
        wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        txHash: '5j7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9',
        usdValue: 125000
      },
      {
        id: '2',
        type: 'sell',
        amount: 890000,
        token: 'CHONK',
        wallet: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7Ybd4dfsEKvn',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        txHash: '4i6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z',
        usdValue: 89000
      },
      {
        id: '3',
        type: 'buy',
        amount: 2100000,
        token: 'CHONK',
        wallet: 'EQuz4ybZaZbsGGckg2wVqzHBwlvFgvctdvQDiDJRKYmq',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        txHash: '3h5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y',
        usdValue: 210000
      },
      {
        id: '4',
        type: 'buy',
        amount: 750000,
        token: 'CHONK',
        wallet: 'FVwqJBjdxgKsQqZpVMdqGNq1wHjKjHgFdSaAsSdFgHjK',
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
        txHash: '2g4H5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X',
        usdValue: 75000
      },
      {
        id: '5',
        type: 'sell',
        amount: 1800000,
        token: 'CHONK',
        wallet: 'GWxrJCkexhLtRrZqWNeqHOr2xIkKkIhGeSbBtTeFhIkL',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        txHash: '1f3G4H5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W',
        usdValue: 180000
      }
    ]
    
    setTransactions(mockTransactions)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchTransactions()
    const interval = setInterval(fetchTransactions, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
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

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-green-400" />
            Live Whale Activity
          </CardTitle>
          <CardDescription className="text-gray-400">
            Real-time large transactions (≥$50K)
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTransactions}
          disabled={isLoading}
          className="border-gray-600 hover:bg-gray-700"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    tx.type === 'buy' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {tx.type === 'buy' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={tx.type === 'buy' ? 'default' : 'destructive'} className="text-xs">
                        {tx.type.toUpperCase()}
                      </Badge>
                      <span className="text-white font-medium">
                        {formatAmount(tx.amount)} {tx.token}
                      </span>
                      <span className="text-gray-400">
                        ({formatUSD(tx.usdValue)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{formatWallet(tx.wallet)}</span>
                      <span>•</span>
                      <span>{getTimeAgo(tx.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => window.open(`https://solscan.io/tx/${tx.txHash}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
