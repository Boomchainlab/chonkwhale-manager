'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BellIcon, PlusIcon, TrashIcon } from 'lucide-react'

interface Alert {
  id: string
  name: string
  condition: string
  threshold: number
  isActive: boolean
  triggered: boolean
  lastTriggered?: string
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAlert, setNewAlert] = useState({
    name: '',
    condition: 'volume_above',
    threshold: 100000
  })

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    }
  }

  const createAlert = async () => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert)
      })
      
      if (response.ok) {
        setNewAlert({ name: '', condition: 'volume_above', threshold: 100000 })
        setShowCreateForm(false)
        fetchAlerts()
      }
    } catch (error) {
      console.error('Failed to create alert:', error)
    }
  }

  const deleteAlert = async (id: string) => {
    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchAlerts()
      }
    } catch (error) {
      console.error('Failed to delete alert:', error)
    }
  }

  const toggleAlert = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      
      if (response.ok) {
        fetchAlerts()
      }
    } catch (error) {
      console.error('Failed to toggle alert:', error)
    }
  }

  const formatThreshold = (condition: string, threshold: number) => {
    switch (condition) {
      case 'volume_above':
        return `Volume > $${threshold.toLocaleString()}`
      case 'transaction_above':
        return `Transaction > $${threshold.toLocaleString()}`
      case 'whale_count_above':
        return `Whales > ${threshold}`
      default:
        return `${threshold}`
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BellIcon className="h-5 w-5" />
            <span>Whale Alerts</span>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCreateForm && (
          <div className="p-4 bg-gray-700/50 rounded-lg space-y-4">
            <div>
              <Label htmlFor="alert-name" className="text-white">Alert Name</Label>
              <Input
                id="alert-name"
                value={newAlert.name}
                onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                placeholder="Large whale transaction"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="alert-condition" className="text-white">Condition</Label>
              <Select
                value={newAlert.condition}
                onValueChange={(value) => setNewAlert({ ...newAlert, condition: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="volume_above">Volume Above</SelectItem>
                  <SelectItem value="transaction_above">Transaction Above</SelectItem>
                  <SelectItem value="whale_count_above">Whale Count Above</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="alert-threshold" className="text-white">Threshold</Label>
              <Input
                id="alert-threshold"
                type="number"
                value={newAlert.threshold}
                onChange={(e) => setNewAlert({ ...newAlert, threshold: Number(e.target.value) })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={createAlert} className="bg-green-600 hover:bg-green-700">
                Create Alert
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No alerts configured yet
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{alert.name}</span>
                    <Badge
                      variant={alert.isActive ? "default" : "secondary"}
                      className={alert.isActive ? "bg-green-600" : "bg-gray-600"}
                    >
                      {alert.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {alert.triggered && (
                      <Badge variant="destructive">Triggered</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatThreshold(alert.condition, alert.threshold)}
                  </div>
                  {alert.lastTriggered && (
                    <div className="text-xs text-gray-500">
                      Last: {new Date(alert.lastTriggered).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAlert(alert.id, alert.isActive)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {alert.isActive ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteAlert(alert.id)}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
