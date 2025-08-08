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
    lastTriggered: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  }
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      alerts: mockAlerts
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, condition, threshold } = body

    const newAlert = {
      id: Date.now().toString(),
      name,
      condition,
      threshold: Number(threshold),
      isActive: true,
      triggered: false,
      lastTriggered: undefined
    }

    mockAlerts.push(newAlert)

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
