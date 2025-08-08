'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Bell, Plus, Trash2, Edit } from 'lucide-react'
import { useState } from 'react'

interface Alert {
  id: string
  name: string
  type: 'volume' | 'price' | 'whale_activity'
  condition: 'above' | 'below'
  value: number
  enabled: boolean
  triggered: number
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'Large Volume Alert',
      type: 'volume',
      condition: 'above',
      value: 1000000,
      enabled: true,
      triggered: 3
    },
    {
      id: '2',
      name: 'Price Drop Alert',
      type: 'price',
      condition: 'below',
      value: 0.05,
      enabled: true,
      triggered: 0
    },
    {
      id: '3',
      name: 'Whale Activity Spike',
      type: 'whale_activity',
      condition: 'above',
      value: 50,
      enabled: false,
      triggered: 12
    }
  ])

  const [newAlert, setNewAlert] = useState({
    name: '',
    type: 'volume' as const,
    condition: 'above' as const,
    value: 0
  })

  const addAlert = () => {
    if (newAlert.name && newAlert.value > 0) {
      const alert: Alert = {
        id: Date.now().toString(),
        ...newAlert,
        enabled: true,
        triggered: 0
      }
      setAlerts([...alerts, alert])
      setNewAlert({ name: '', type: 'volume', condition: 'above', value: 0 })
    }
  }

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ))
  }

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'volume': return 'Volume'
      case 'price': return 'Price'
      case 'whale_activity': return 'Whale Activity'
      default: return type
    }
  }

  const formatValue = (type: string, value: number) => {
    switch (type) {
      case 'volume': return `$${value.toLocaleString()}`
      case 'price': return `$${value}`
      case 'whale_activity': return `${value} transactions`
      default: return value.toString()
    }
  }

  return (
    <div className="space-y-6">
      {/* Create New Alert */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Alert
          </CardTitle>
          <CardDescription className="text-gray-400">
            Set up custom alerts for whale activity monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alert-name" className="text-gray-300">Alert Name</Label>
              <Input
                id="alert-name"
                placeholder="Enter alert name"
                value={newAlert.name}
                onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert-type" className="text-gray-300">Alert Type</Label>
              <Select value={newAlert.type} onValueChange={(value: any) => setNewAlert({ ...newAlert, type: value })}>
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="whale_activity">Whale Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert-condition" className="text-gray-300">Condition</Label>
              <Select value={newAlert.condition} onValueChange={(value: any) => setNewAlert({ ...newAlert, condition: value })}>
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="above">Above</SelectItem>
                  <SelectItem value="below">Below</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert-value" className="text-gray-300">Value</Label>
              <Input
                id="alert-value"
                type="number"
                placeholder="Enter threshold value"
                value={newAlert.value || ''}
                onChange={(e) => setNewAlert({ ...newAlert, value: parseFloat(e.target.value) || 0 })}
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>
          </div>
          <Button onClick={addAlert} className="w-full bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Active Alerts ({alerts.filter(a => a.enabled).length})
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your whale tracking alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 border border-gray-700"
              >
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={alert.enabled}
                    onCheckedChange={() => toggleAlert(alert.id)}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">{alert.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getAlertTypeLabel(alert.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      Trigger when {alert.condition} {formatValue(alert.type, alert.value)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Triggered {alert.triggered} times
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAlert(alert.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No alerts configured yet</p>
                <p className="text-sm">Create your first alert above</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
