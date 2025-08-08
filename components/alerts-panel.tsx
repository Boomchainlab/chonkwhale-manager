'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Bell, Plus, Trash2, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface Alert {
  id: string
  name: string
  type: 'volume' | 'price' | 'whale_activity'
  condition: 'above' | 'below'
  value: number
  enabled: boolean
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'Large Buy Alert',
      type: 'volume',
      condition: 'above',
      value: 500000,
      enabled: true
    },
    {
      id: '2',
      name: 'Whale Activity Spike',
      type: 'whale_activity',
      condition: 'above',
      value: 10,
      enabled: true
    }
  ])

  const [newAlert, setNewAlert] = useState({
    name: '',
    type: 'volume' as Alert['type'],
    condition: 'above' as Alert['condition'],
    value: 0
  })

  const addAlert = () => {
    if (!newAlert.name || !newAlert.value) {
      toast.error('Please fill in all fields')
      return
    }

    const alert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      ...newAlert,
      enabled: true
    }

    setAlerts(prev => [...prev, alert])
    setNewAlert({ name: '', type: 'volume', condition: 'above', value: 0 })
    toast.success('Alert created successfully')
  }

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
    toast.success('Alert deleted')
  }

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ))
  }

  const getAlertTypeLabel = (type: Alert['type']) => {
    switch (type) {
      case 'volume': return 'Volume'
      case 'price': return 'Price'
      case 'whale_activity': return 'Whale Activity'
      default: return type
    }
  }

  const getAlertValueLabel = (alert: Alert) => {
    switch (alert.type) {
      case 'volume':
        return `${alert.value.toLocaleString()} CHONK9K`
      case 'price':
        return `$${alert.value}`
      case 'whale_activity':
        return `${alert.value} transactions/hour`
      default:
        return alert.value.toString()
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Create New Alert */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Alert
          </CardTitle>
          <CardDescription>
            Set up custom alerts for whale activity and market movements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alert-name" className="text-gray-300">Alert Name</Label>
            <Input
              id="alert-name"
              placeholder="e.g., Large Buy Alert"
              value={newAlert.name}
              onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
              className="bg-gray-900/50 border-gray-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Alert Type</Label>
              <Select
                value={newAlert.type}
                onValueChange={(value: Alert['type']) => setNewAlert(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="whale_activity">Whale Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Condition</Label>
              <Select
                value={newAlert.condition}
                onValueChange={(value: Alert['condition']) => setNewAlert(prev => ({ ...prev, condition: value }))}
              >
                <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Above</SelectItem>
                  <SelectItem value="below">Below</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alert-value" className="text-gray-300">Threshold Value</Label>
            <Input
              id="alert-value"
              type="number"
              placeholder="Enter threshold value"
              value={newAlert.value || ''}
              onChange={(e) => setNewAlert(prev => ({ ...prev, value: Number(e.target.value) }))}
              className="bg-gray-900/50 border-gray-600 text-white"
            />
          </div>

          <Button onClick={addAlert} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Alerts ({alerts.filter(a => a.enabled).length})
          </CardTitle>
          <CardDescription>
            Manage your whale tracking alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No alerts configured</p>
                <p className="text-sm">Create your first alert to get started</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 border border-gray-700"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{alert.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getAlertTypeLabel(alert.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      Trigger when {alert.condition} {getAlertValueLabel(alert)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.enabled}
                      onCheckedChange={() => toggleAlert(alert.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
