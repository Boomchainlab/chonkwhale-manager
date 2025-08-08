import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';

interface AlertConfig {
  type: string;
  label: string;
  description: string;
  enabled: boolean;
}

export default function AlertConfigurationPanel() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([
    {
      type: 'new_whale',
      label: 'New Whale',
      description: 'Alert when new wallets reach whale threshold',
      enabled: true,
    },
    {
      type: 'whale_exit',
      label: 'Whale Exit',
      description: 'Alert when whales sell below threshold',
      enabled: true,
    },
    {
      type: 'large_transfer',
      label: 'Large Transfer',
      description: 'Alert on transfers over 100K tokens',
      enabled: false,
    },
    {
      type: 'price_impact',
      label: 'Price Impact',
      description: 'Alert on significant price movements',
      enabled: true,
    },
  ]);

  // Fetch existing alerts
  const { data: existingAlerts = [] } = useQuery({
    queryKey: ['/api/alerts'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Create/update alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (alertData: any) => {
      const response = await apiRequest('POST', '/api/alerts', alertData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: "Alert Updated",
        description: "Your alert configuration has been saved",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to update alert configuration",
        variant: "destructive",
      });
    },
  });

  const handleToggle = async (type: string, enabled: boolean) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to configure alerts",
        variant: "destructive",
      });
      return;
    }

    if (!user || user.subscriptionTier === 'free') {
      toast({
        title: "Upgrade Required",
        description: "Custom alerts require a paid subscription",
        variant: "destructive",
      });
      return;
    }

    // Update local state
    setAlertConfigs(prev => 
      prev.map(config => 
        config.type === type ? { ...config, enabled } : config
      )
    );

    // Find existing alert or create new one
    const existingAlert = existingAlerts.find((alert: any) => 
      alert.conditions?.[0]?.type === type
    );

    const alertData = {
      name: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Alert`,
      type,
      conditions: [{ type, value: type === 'large_transfer' ? 100000 : 5 }],
      channels: ['discord'], // Default to Discord
      isActive: enabled,
    };

    if (existingAlert) {
      // Update existing alert
      try {
        await apiRequest('PUT', `/api/alerts/${existingAlert.id}`, {
          ...alertData,
          isActive: enabled,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
        toast({
          title: "Alert Updated",
          description: `${alertData.name} has been ${enabled ? 'enabled' : 'disabled'}`,
        });
      } catch (error) {
        // Revert local state on error
        setAlertConfigs(prev => 
          prev.map(config => 
            config.type === type ? { ...config, enabled: !enabled } : config
          )
        );
        toast({
          title: "Error",
          description: "Failed to update alert",
          variant: "destructive",
        });
      }
    } else if (enabled) {
      // Create new alert
      createAlertMutation.mutate(alertData);
    }
  };

  return (
    <Card className="bg-navy-main border-navy-light">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Alert Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {alertConfigs.map((config) => (
            <div key={config.type} className="p-4 bg-navy-dark bg-opacity-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">{config.label}</span>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(checked) => handleToggle(config.type, checked)}
                  disabled={createAlertMutation.isPending}
                />
              </div>
              <p className="text-xs text-text-secondary">{config.description}</p>
            </div>
          ))}
        </div>

        {(!user || user.subscriptionTier === 'free') && (
          <div className="mt-6 p-4 bg-accent-orange bg-opacity-10 border border-accent-orange/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <i className="fas fa-crown text-accent-orange mt-1"></i>
              <div>
                <h4 className="font-semibold text-white">Upgrade for Custom Alerts</h4>
                <p className="text-sm text-text-secondary mt-1">
                  Get advanced alert configurations, webhook integrations, and unlimited notifications with a Pro subscription.
                </p>
                <Button 
                  size="sm"
                  className="mt-3 bg-accent-orange hover:bg-accent-orange/80 text-white"
                >
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
