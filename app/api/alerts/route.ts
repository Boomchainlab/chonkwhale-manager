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
  userId?: string
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
 * Handles GET requests to retrieve the current list of alerts.
 *
 * Returns a JSON response containing a success flag, the array of alert objects, and the total count of alerts.
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

/**
 * Handles POST requests to create a new alert object.
 *
 * Parses the request body for required fields, validates input, and adds a new alert to in-memory storage. Returns a JSON response with the created alert on success, or an error message with appropriate status code on failure.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, condition, threshold } = body

    if (!name || !condition || !threshold) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      condition,
      threshold: Number(threshold),
      isActive: true,
      triggered: false,
      createdAt: new Date().toISOString()
    }

    alerts.push(newAlert)

    return NextResponse.json({
      success: true,
      alert: newAlert
    })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}
