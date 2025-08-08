'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react'

interface WhaleData {
  rank: number
  wallet: string
  balance: number
  percentage: number
  change24h: number
  lastActivity: string
}

export function TopWhales() {
  const [whales, setWhales] = useState<WhaleData[]>([])

  useEffect(() => {
    // Mock whale data
    const generateWhaleData = (): WhaleData[] => {
      return Array.from({ length: 20 }, (_, i) => ({
        rank: i + 1,
        wallet: `${Math.random().toString(36).substr(2, 4)}...${Math.random().toString(36).substr(2, 4)}`,
        balance: Math.floor(Math.random() * 10000000 + 1000000),
        percentage: Math.random() * 5 + 0.1,
        change24h: (Math.random() - 0.5) * 20,
        lastActivity: `${Math.floor(Math.random() * 24)}h ago`
      })).sort((a, b) => b.balance - a.balance)
    }

    setWhales(generateWhaleData())

    // Update every 30 seconds
    const interval = setInterval(() => {
      setWhales(generateWhaleData())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(1)}M`
    }
    if (balance >= 1000) {
      return `${(balance / 1000).toFixed(1)}K`
    }
    return balance.toString()
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5" />
          Top CHONK9K Whales
        </CardTitle>
        <CardDescription>
          Largest token holders and their recent activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="text-gray-300">Rank</TableHead>
                <TableHead className="text-gray-300">Wallet</TableHead>
                <TableHead className="text-gray-300">Balance</TableHead>
                <TableHead className="text-gray-300">% of Supply</TableHead>
                <TableHead className="text-gray-300">24h Change</TableHead>
                <TableHead className="text-gray-300">Last Activity</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {whales.map((whale) => (
                <TableRow key={whale.wallet} className="border-gray-700 hover:bg-gray-800/30">
                  <TableCell className="font-medium text-white">
                    #{whale.rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {whale.wallet}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-white">
                    {formatBalance(whale.balance)} CHONK9K
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {formatPercentage(whale.percentage)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {whale.change24h >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span className={whale.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatChange(whale.change24h)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {whale.lastActivity}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://solscan.io/account/${whale.wallet}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
