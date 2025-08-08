import { NextRequest, NextResponse } from 'next/server'

interface AlertHistoryItem {
  id: string
  alertId: string
  alertName: string
  message: string
  severity: 'low' | 'medium' | 'high'
  timestamp: string
  triggerData?: {
    walletAddress?: string
    amount?: number
    price?: number
    volume?: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const alertId = searchParams.get('alertId')
    const severity = searchParams.get('severity')

    // Mock alert history data
    const mockHistory: AlertHistoryItem[] = [
      {
        id: '1',
        alertId: '1',
        alertName: 'Large Volume Alert',
        message: '🐋 Large Volume Alert triggered! Whale 7xKX...AsU bought 1.25M CHONK (~$125K) with 2.3% price impact.',
        severity: 'high',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        triggerData: {
          walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          amount: 1250000,
          volume: 125000
        }
      },
      {
        id: '2',
        alertId: '3',
        alertName: 'Whale Activity Spike',
        message: '📈 Whale Activity Spike detected! 67 large transactions in the last hour, exceeding threshold of 50.',
        severity: 'medium',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        triggerData: {
          volume: 67
        }
      },
      {
        id: '3',
        alertId: '1',
        alertName: 'Large Volume Alert',
        message: '🐋 Large Volume Alert triggered! Whale EQuz...Ymq bought 2.1M CHONK (~$210K) with 4.1% price impact.',
        severity: 'high',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        triggerData: {
          walletAddress: 'EQuz4ybZaZbsGGckg2wVqzHBwlvFgvctdvQDiDJRKYmq',
          amount: 2100000,
          volume: 210000
        }
      },
      {
        id: '4',
        alertId: '3',
        alertName: 'Whale Activity Spike',
        message: '📈 Whale Activity Spike detected! 89 large transactions in the last hour, exceeding threshold of 50.',
        severity: 'medium',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        triggerData: {
          volume: 89
        }
      },
      {
        id: '5',
        alertId: '1',
        alertName: 'Large Volume Alert',
        message: '🐋 Large Volume Alert triggered! Whale GWxr...IkL sold 1.8M CHONK (~$180K) with -3.2% price impact.',
        severity: 'high',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        triggerData: {
          walletAddress: 'GWxrJCkexhLtRrZqWNeqHOr2xIkKkIhGeSbBtTeFhIkL',
          amount: 1800000,
          volume: 180000
        }
      }
    ]

    let filteredHistory = mockHistory

    // Filter by alert ID
    if (alertId) {
      filteredHistory = filteredHistory.filter(item => item.alertId === alertId)
    }

    // Filter by severity
    if (severity && ['low', 'medium', 'high'].includes(severity)) {
      filteredHistory = filteredHistory.filter(item => item.severity === severity)
    }

    // Apply limit
    const limitedHistory = filteredHistory.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: limitedHistory,
      total: filteredHistory.length,
      limit
    })
  } catch (error) {
    console.error('Error fetching alert history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alert history' },
      { status: 500 }
    )
  }
}
