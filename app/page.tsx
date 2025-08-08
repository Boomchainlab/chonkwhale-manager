"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WhaleActivityFeed } from "@/components/whale-activity-feed"
import { WhaleMetrics } from "@/components/whale-metrics"
import { AlertsPanel } from "@/components/alerts-panel"
import { TopWhales } from "@/components/top-whales"
import { PriceChart } from "@/components/price-chart"
import { TrendingUp, Wallet, Bell, Activity } from 'lucide-react'

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(false)
  const [whaleCount, setWhaleCount] = useState(0)
  const [totalVolume, setTotalVolume] = useState(0)
  const [alerts, setAlerts] = useState(0)

  useEffect(() => {
    // Initialize WebSocket connection for real-time data
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001')
    
    ws.onopen = () => {
      setIsConnected(true)
      console.log('Connected to whale tracking service')
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'whale_metrics') {
        setWhaleCount(data.whaleCount)
        setTotalVolume(data.totalVolume)
        setAlerts(data.alerts)
      }
    }
    
    ws.onclose = () => {
      setIsConnected(false)
      console.log('Disconnected from whale tracking service')
    }
    
    return () => {
      ws.close()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-green-400">CHONK9K</h1>
              <span className="text-gray-400">Whale Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Live</span>
              </div>
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <WhaleMetrics />
            <PriceChart />
            <WhaleActivityFeed />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            <AlertsPanel />
            <TopWhales />
          </div>
        </div>
      </main>
    </div>
  )
}
