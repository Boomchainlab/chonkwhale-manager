import { NextRequest, NextResponse } from 'next/server'

interface Alert {
  id: string
  name: string
  type: 'volume' | 'price' | 'whale_activity' | 'transaction_size'
  condition: 'above' | 'below' | 'equals'
  threshold: number
  isActive: boolean
  triggeredCount: number
  lastTriggered?: string
  createdAt: string
  updatedAt: string
}

// Mock alerts storage (same as in route.ts - in production this would be shared via database)
let mockAlerts: Alert[] = [
  {
    id: '1',
    name: 'Large Volume Alert',
    type: 'volume',
    condition: 'above',
    threshold: 1000000,
    isActive: true,
    triggeredCount: 3,
    lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Price Drop Alert',
    type: 'price',
    condition: 'below',
    threshold: 0.05,
    isActive: true,
    triggeredCount: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Whale Activity Spike',
    type: 'whale_activity',
    condition: 'above',
    threshold: 50,
    isActive: false,
    triggeredCount: 12,
    lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = params.id
    const alert = mockAlerts.find(a => a.id === alertId)

    if (!alert) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: alert
    })
  } catch (error) {
    console.error('Error fetching alert:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alert' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = params.id
    const body = await request.json()
    
    const alertIndex = mockAlerts.findIndex(a => a.id === alertId)
    if (alertIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      )
    }

    // Update alert
    const updatedAlert = {
      ...mockAlerts[alertIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    mockAlerts[alertIndex] = updatedAlert

    return NextResponse.json({
      success: true,
      data: updatedAlert
    })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = params.id
    const alertIndex = mockAlerts.findIndex(a => a.id === alertId)
    
    if (alertIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      )
    }

    // Remove alert
    mockAlerts.splice(alertIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}
