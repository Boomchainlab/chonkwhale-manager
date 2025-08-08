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

// Mock alerts storage (in production, this would be in your database)
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active')
    const type = searchParams.get('type')

    let filteredAlerts = mockAlerts

    // Filter by active status
    if (isActive !== null) {
      const activeFilter = isActive === 'true'
      filteredAlerts = filteredAlerts.filter(alert => alert.isActive === activeFilter)
    }

    // Filter by type
    if (type && ['volume', 'price', 'whale_activity', 'transaction_size'].includes(type)) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === type)
    }

    return NextResponse.json({
      success: true,
      data: filteredAlerts,
      total: filteredAlerts.length
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
    const { name, type, condition, threshold } = body

    // Validate required fields
    if (!name || !type || !condition || threshold === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate type
    if (!['volume', 'price', 'whale_activity', 'transaction_size'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid alert type' },
        { status: 400 }
      )
    }

    // Validate condition
    if (!['above', 'below', 'equals'].includes(condition)) {
      return NextResponse.json(
        { success: false, error: 'Invalid condition' },
        { status: 400 }
      )
    }

    // Create new alert
    const newAlert: Alert = {
      id: Date.now().toString(),
      name,
      type,
      condition,
      threshold: parseFloat(threshold),
      isActive: true,
      triggeredCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockAlerts.push(newAlert)

    return NextResponse.json({
      success: true,
      data: newAlert
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}
