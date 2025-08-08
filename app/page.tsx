import { WhaleActivityFeed } from '@/components/whale-activity-feed'
import { WhaleMetrics } from '@/components/whale-metrics'
import { AlertsPanel } from '@/components/alerts-panel'
import { TopWhales } from '@/components/top-whales'
import { PriceChart } from '@/components/price-chart'
import { WalletConnectButton } from '@/components/wallet-connect-button'
import { Activity, TrendingUp, Bell, Users, BarChart3 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C9K</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">CHONK9K</h1>
                  <p className="text-xs text-gray-400">Whale Manager</p>
                </div>
              </div>
            </div>
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Solana Whale Dashboard
          </h2>
          <p className="text-gray-400">
            Track large transactions and whale movements in real-time
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="whales" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Top Whales
            </TabsTrigger>
            <TabsTrigger value="price" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Price
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <WhaleMetrics />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WhaleActivityFeed />
              <TopWhales />
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <WhaleActivityFeed />
          </TabsContent>

          <TabsContent value="whales">
            <TopWhales />
          </TabsContent>

          <TabsContent value="price">
            <PriceChart />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
