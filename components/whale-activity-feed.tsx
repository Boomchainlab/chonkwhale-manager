'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpIcon, ArrowDownIcon, ExternalLinkIcon } from 'lucide-react'

interface WhaleTransaction {
  id: string
  walletAddress: string
  signature: string
  transactionType: 'buy' | 'sell' | 'transfer'
  tokenSymbol: string
  amount: number
  usdValue: number
  blockTime: string
  knownEntity?: string
}

export function WhaleActivityFeed() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/whale-transactions')
        const data = await response.json()
        setTransactions(data.transactions || [])
      } catch (error) {
        console.error('Failed to fetch whale transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
    const interval = setInterval(fetchTransactions, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)}K`
    }
    return amount.toFixed(2)
  }

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowUpIcon className="h-4 w-4 text-green-400" />
      case 'sell':
        return <ArrowDownIcon className="h-4 w-4 text-red-400" />
      default:
        return <ExternalLinkIcon className="h-4 w-4 text-blue-400" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'text-green-400'
      case 'sell':
        return 'text-red-400'
      default:
        return 'text-blue-400'
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Live Whale Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
        <CardTitle className="text-white flex items-center justify-between">
          Live Whale Activity
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Real-time</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No whale transactions detected yet...
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(tx.transactionType)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">
                        {formatAddress(tx.walletAddress)}
                      </span>
                      {tx.knownEntity && (
                        <Badge variant="secondary" className="text-xs">
                          {tx.knownEntity}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(tx.blockTime).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${getTransactionColor(tx.transactionType)}`}>
                    {tx.transactionType.toUpperCase()} {formatAmount(tx.amount)} {tx.tokenSymbol}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatUSD(tx.usdValue)}
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
