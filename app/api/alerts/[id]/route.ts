import { NextRequest, NextResponse } from 'next/server'

// Mock alerts storage - in production, use your database
let mockAlerts = [
  {
    id: '1',
    name: 'Large Buy Alert',
    condition: 'transaction_above',
    threshold: 100000,
    isActive: true,
    triggered: false,
    lastTriggered: undefined
  },
  {
    id: '2',
    name: 'High Volume Alert',
    condition: 'volume_above',
    threshold: 500000,
    isActive: true,
    triggered: true,
    lastTriggered: new Date(Date.now() - 3600000).toISOString()
  }
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const alertIndex = mockAlerts.findIndex(alert => alert.id === id)
    if (alertIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      )
    }

    mockAlerts[alertIndex] = { ...mockAlerts[alertIndex], ...body }

    return NextResponse.json({
      success: true,
      alert: mockAlerts[alertIndex]
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
    
    const alertIndex = mockAlerts.findIndex(alert => alert.id === id)
    if (alertIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      )
    }

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
