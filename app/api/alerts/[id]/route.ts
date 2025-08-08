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

/**
 * Updates an existing alert by its ID with the provided data.
 *
 * Accepts a JSON body containing alert fields to update. Returns a JSON response with the updated alert on success, or an error message if the alert is not found or an error occurs.
 */
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

/**
 * Deletes an alert identified by the provided `id` from the in-memory alerts array.
 *
 * Returns a JSON response indicating success or failure. If the alert does not exist, responds with a 404 status and error message.
 */
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
