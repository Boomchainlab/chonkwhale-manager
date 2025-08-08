import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/useWebSocket';

interface WhaleEvent {
  id: string;
  type: 'new_whale' | 'whale_exit' | 'whale_movement' | 'large_transfer';
  message: string;
  timestamp: string;
  whale?: any;
}

export default function LiveWhaleFeed() {
  const [events, setEvents] = useState<WhaleEvent[]>([]);
  const { connected, message } = useWebSocket();

  useEffect(() => {
    if (message) {
      try {
        const data = JSON.parse(message);
        if (data.type !== 'connection' && data.type !== 'stats_update') {
          const event: WhaleEvent = {
            id: Date.now().toString(),
            type: data.type,
            message: data.data?.message || `${data.type} event`,
            timestamp: data.timestamp || new Date().toISOString(),
            whale: data.data?.whale,
          };
          
          setEvents(prev => [event, ...prev.slice(0, 9)]); // Keep only 10 most recent
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [message]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'new_whale': return { icon: 'fas fa-arrow-up', color: 'accent-green' };
      case 'whale_exit': return { icon: 'fas fa-arrow-down', color: 'accent-orange' };
      case 'whale_movement': return { icon: 'fas fa-plus', color: 'accent-green' };
      case 'large_transfer': return { icon: 'fas fa-exchange-alt', color: 'yellow-500' };
      default: return { icon: 'fas fa-info', color: 'text-secondary' };
    }
  };

  const getEventTitle = (type: string) => {
    switch (type) {
      case 'new_whale': return 'New Whale Detected';
      case 'whale_exit': return 'Whale Exit';
      case 'whale_movement': return 'Whale Movement';
      case 'large_transfer': return 'Large Transfer';
      default: return 'Whale Activity';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return eventTime.toLocaleDateString();
  };

  return (
    <Card className="bg-navy-main border-navy-light">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">Live Whale Feed</CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 ${connected ? 'bg-accent-green animate-pulse' : 'bg-red-500'} rounded-full`}></div>
            <span className="text-sm text-text-secondary">{connected ? 'Live' : 'Disconnected'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <i className="fas fa-satellite-dish text-2xl mb-2"></i>
              <p>Waiting for whale activity...</p>
              <p className="text-sm mt-1">Live updates will appear here</p>
            </div>
          ) : (
            events.map((event) => {
              const eventStyle = getEventIcon(event.type);
              return (
                <div key={event.id} className="flex items-center space-x-4 p-3 bg-navy-dark bg-opacity-50 rounded-lg">
                  <div className={`w-10 h-10 bg-${eventStyle.color} bg-opacity-20 rounded-full flex items-center justify-center`}>
                    <i className={`${eventStyle.icon} text-${eventStyle.color} text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{getEventTitle(event.type)}</p>
                      <span className="text-xs text-text-secondary">{formatTimeAgo(event.timestamp)}</span>
                    </div>
                    <p className="text-sm text-text-secondary">{event.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
