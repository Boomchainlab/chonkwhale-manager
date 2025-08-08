import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

interface Whale {
  id: string;
  walletAddress: string;
  balance: string;
  balanceUsd: string;
  rank: number;
  lastActivity: string;
  isActive: boolean;
}

export default function WhaleTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: whales = [], isLoading, error } = useQuery({
    queryKey: ['/api/whales/top', '50'],
    retry: false,
  });

  const handleExport = async (format: 'json' | 'csv') => {
    if (!user || user.subscriptionTier === 'free') {
      toast({
        title: "Upgrade Required",
        description: "Export feature requires a paid subscription",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch(`/api/export/whales?format=${format}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
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
        throw new Error(`Export failed: ${response.statusText}`);
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'whales.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'whales.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Export Successful",
        description: `Whale data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    if (isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return null;
    }
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card className="bg-navy-main border-navy-light">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">Top Whales</CardTitle>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="flex items-center space-x-2 px-4 py-2 bg-accent-green bg-opacity-10 text-accent-green hover:bg-opacity-20 border-0"
            >
              <i className="fas fa-download"></i>
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </Button>
            <Button variant="outline" className="border-navy-light hover:bg-navy-light">
              <i className="fas fa-filter mr-2"></i>
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-accent-green border-t-transparent rounded-full" />
          </div>
        ) : whales.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <i className="fas fa-fish text-2xl mb-2"></i>
            <p>No whale data available</p>
            <p className="text-sm mt-1">Whales will appear here once detected</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-light">
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Wallet</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Balance</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Last Activity</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {whales.map((whale: Whale, index: number) => (
                    <tr key={whale.id} className="border-b border-navy-light hover:bg-navy-dark bg-opacity-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-accent-green to-accent-orange rounded-full flex items-center justify-center text-xs font-semibold">
                            W{whale.rank || index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-white">{formatAddress(whale.walletAddress)}</p>
                            <p className="text-xs text-text-secondary">Rank #{whale.rank || index + 1}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-white">{formatBalance(whale.balance)} CHONK9K</p>
                          {whale.balanceUsd && (
                            <p className="text-sm text-text-secondary">~${parseFloat(whale.balanceUsd).toLocaleString()}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-white">{formatTimeAgo(whale.lastActivity)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          className={whale.isActive 
                            ? "bg-accent-green bg-opacity-10 text-accent-green border-accent-green/20"
                            : "bg-gray-500 bg-opacity-10 text-gray-500 border-gray-500/20"
                          }
                        >
                          {whale.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-text-secondary">
                Showing {Math.min(whales.length, 50)} whales
              </p>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="border-navy-light hover:bg-navy-light"
                >
                  Previous
                </Button>
                <Button 
                  size="sm"
                  className="bg-accent-green text-white hover:bg-accent-green/80"
                >
                  {currentPage}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="border-navy-light hover:bg-navy-light"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
