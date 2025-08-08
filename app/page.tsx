'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WhaleActivityFeed } from '@/components/whale-activity-feed'
import { WhaleMetrics } from '@/components/whale-metrics'
import { AlertsPanel } from '@/components/alerts-panel'
import { TopWhales } from '@/components/top-whales'
import { PriceChart } from '@/components/price-chart'
import { WalletConnectButton } from '@/components/wallet-connect-button'
import { Activity, TrendingUp, Bell, Users, BarChart3, Settings } from 'lucide-react'
import { toast } from 'sonner'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')

  useEffect(() => {
    // Simulate loading and connection check
    const timer = setTimeout(() => {
      setIsLoading(false)
      setConnectionStatus('connected')
      toast.success('Connected to Solana network')
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <h2 className="text-xl font-semibold text-white">Loading CHONK9K Whale Manager...</h2>
          <p className="text-gray-400">Connecting to Solana network</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  CHONK9K
                </h1>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                {connectionStatus === 'connected' ? 'Live' : 'Connecting...'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <WalletConnectButton />
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-white">
              Professional Whale Tracking
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Monitor large CHONK9K transactions, track whale movements, and stay ahead of market trends with real-time analytics.
            </p>
          </div>

          {/* Metrics Overview */}
          <WhaleMetrics />

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Live Feed
              </TabsTrigger>
              <TabsTrigger value="whales" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Top Whales
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Alerts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-6">
              <WhaleActivityFeed />
            </TabsContent>

            <TabsContent value="whales" className="space-y-6">
              <TopWhales />
            </TabsContent>

            <TabsContent value="charts" className="space-y-6">
              <div className="grid gap-6">
                <PriceChart />
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Market Analysis
                    </CardTitle>
                    <CardDescription>
                      Advanced analytics and market insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-400">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Advanced analytics coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <AlertsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 CHONK9K Whale Manager. Professional Solana whale tracking platform.</p>
            <p className="text-sm mt-2">Built with Next.js, Solana Web3.js, and Reown AppKit</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
