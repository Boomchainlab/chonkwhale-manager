'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Activity, ExternalLink, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { toast } from 'sonner'

interface WhaleTransaction {
  id: string
  wallet: string
  type: 'buy' | 'sell'
  amount: number
  value: number
  timestamp: Date
  txHash: string
}

export function WhaleActivityFeed() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])
  const [isLive, setIsLive] = useState(true)

  // Mock data generator
  const generateMockTransaction = (): WhaleTransaction => {
    const types: ('buy' | 'sell')[] = ['buy', 'sell']
    const type = types[Math.floor(Math.random() * types.length)]
    const amount = Math.floor(Math.random() * 1000000) + 100000
    const value = amount * 0.00012 // Mock price
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      wallet: `${Math.random().toString(36).substr(2, 4)}...${Math.random().toString(36).substr(2, 4)}`,
      type,
      amount,
      value,
      timestamp: new Date(),
      txHash: Math.random().toString(36).substr(2, 16)
    }
  }

  useEffect(() => {
    // Initial load
    const initialTransactions = Array.from({ length: 10 }, generateMockTransaction)
    setTransactions(initialTransactions)

    // Live updates
    const interval = setInterval(() => {
      if (isLive) {
        const newTransaction = generateMockTransaction()
        setTransactions(prev => [newTransaction, ...prev.slice(0, 49)]) // Keep last 50
        
        if (newTransaction.amount > 500000) {
          toast.success(`🐋 Large ${newTransaction.type} detected: ${newTransaction.amount.toLocaleString()} CHONK9K`)
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`
    }
    return amount.toString()
  }

  const formatValue = (value: number) => {
    return `$${value.toFixed(2)}`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Whale Activity
            </CardTitle>
            <CardDescription>
              Real-time large CHONK9K transactions (100K+ tokens)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isLive ? "default" : "secondary"} className="bg-green-500/20 text-green-400 border-green-500/30">
              <div className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              {isLive ? 'Live' : 'Paused'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
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
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {tx.wallet}
                      </Badge>
                      <Badge 
                        variant={tx.type === 'buy' ? 'default' : 'destructive'}
                        className={tx.type === 'buy' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                      >
                        {tx.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatTime(tx.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-semibold text-white">
                    {formatAmount(tx.amount)} CHONK9K
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatValue(tx.value)}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-4"
                  onClick={() => window.open(`https://solscan.io/tx/${tx.txHash}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
