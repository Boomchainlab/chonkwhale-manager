import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import MetricCard from "@/components/MetricCard";
import WhaleActivityChart from "@/components/WhaleActivityChart";
import LiveWhaleFeed from "@/components/LiveWhaleFeed";
import WhaleTable from "@/components/WhaleTable";
import AlertConfigurationPanel from "@/components/AlertConfigurationPanel";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-navy-dark flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent-green border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-navy-dark text-white">
      <Sidebar />
      
      {/* Mobile Header */}
      <header className="lg:hidden bg-navy-main border-b border-navy-light p-4 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-accent-green to-accent-orange rounded-xl flex items-center justify-center font-bold text-sm">
              C9K
            </div>
            <h1 className="text-xl font-semibold">Whale Manager</h1>
          </div>
          <Button variant="ghost" size="sm">
            <i className="fas fa-bars text-xl"></i>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:block bg-navy-main border-b border-navy-light p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Whale Dashboard</h2>
              <p className="text-text-secondary mt-1">Real-time tracking for CHONK9K token</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <i className="fas fa-bell text-xl"></i>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-orange rounded-full"></span>
              </Button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-accent-green to-accent-orange rounded-full flex items-center justify-center font-semibold">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium">{user?.firstName || user?.email || 'User'}</p>
                  <p className="text-sm text-text-secondary capitalize">{user?.subscriptionTier || 'free'} Member</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Whales"
              value={analytics?.totalWhales || 0}
              change={"+5 today"}
              changeType="positive"
              icon="fish"
              iconColor="accent-green"
            />
            <MetricCard
              title="Active Whales"
              value={analytics?.activeWhales || 0}
              change="3 pending"
              changeType="neutral"
              icon="bell"
              iconColor="accent-orange"
            />
            <MetricCard
              title="24h Volume"
              value={`$${parseFloat(analytics?.volume24h || '0').toLocaleString()}`}
              change="+12.5%"
              changeType="positive"
              icon="chart-bar"
              iconColor="accent-green"
            />
            <MetricCard
              title="Price Impact"
              value={`${parseFloat(analytics?.priceImpact24h || '0').toFixed(2)}%`}
              change="Bullish"
              changeType="positive"
              icon="percentage"
              iconColor="accent-green"
            />
          </div>

          {/* Charts and Live Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WhaleActivityChart />
            <LiveWhaleFeed />
          </div>

          {/* Whale Table */}
          <WhaleTable />

          {/* Alert Configuration */}
          <AlertConfigurationPanel />
        </div>
      </main>
    </div>
  );
}
