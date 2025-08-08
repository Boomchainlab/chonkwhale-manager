import { NextRequest, NextResponse } from 'next/server'

interface Alert {
  id: string
  name: string
  condition: string
  threshold: number
  isActive: boolean
  triggered: boolean
  lastTriggered?: string
  createdAt: string
}

// In-memory storage for demo (use database in production)
let alerts: Alert[] = [
  {
    id: '1',
    name: 'Large Buy Orders',
    condition: 'volume_above',
    threshold: 1000000,
    isActive: true,
    triggered: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Whale Dump Alert',
    condition: 'sell_volume_above',
    threshold: 5000000,
    isActive: true,
    triggered: true,
    lastTriggered: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const alertIndex = alerts.findIndex(alert => alert.id === id)
    if (alertIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      )
    }

    alerts[alertIndex] = { ...alerts[alertIndex], ...body }

    return NextResponse.json({
      success: true,
      alert: alerts[alertIndex]
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
    const { id } = params
    
    const alertIndex = alerts.findIndex(alert => alert.id === id)
    if (alertIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      )
    }

    alerts.splice(alertIndex, 1)

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
