import { NextRequest, NextResponse } from 'next/server'

interface AlertHistory {
  id: string
  alertId: string
  alertName: string
  message: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
  data?: any
}

const generateMockAlertHistory = (): AlertHistory[] => {
  const alerts = [
    {
      id: '1',
      alertId: '1',
      alertName: 'Large Buy Orders',
      message: 'Significant buy pressure detected: 2.1M CHONK9K tokens ($210K)',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      severity: 'medium' as const,
      data: { amount: 2100000, usdValue: 210000, type: 'buy' }
    },
    {
      id: '2',
      alertId: '2',
      alertName: 'Whale Dump Alert',
      message: 'Large sell order detected: 5.2M CHONK9K tokens ($520K)',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      severity: 'high' as const,
      data: { amount: 5200000, usdValue: 520000, type: 'sell' }
    },
    {
      id: '3',
      alertId: '1',
      alertName: 'Large Buy Orders',
      message: 'Whale accumulation: 1.8M CHONK9K tokens ($180K)',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      severity: 'medium' as const,
      data: { amount: 1800000, usdValue: 180000, type: 'buy' }
    },
    {
      id: '4',
      alertId: '3',
      alertName: 'Price Movement Alert',
      message: 'CHONK9K price increased by 15% in the last hour',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      severity: 'low' as const,
      data: { priceChange: 15, timeframe: '1h' }
    },
    {
      id: '5',
      alertId: '2',
      alertName: 'Whale Dump Alert',
      message: 'Multiple large sells detected: 8.5M CHONK9K tokens ($850K)',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      severity: 'high' as const,
      data: { amount: 8500000, usdValue: 850000, type: 'sell', count: 3 }
    }
  ]

  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export async function GET(request: NextRequest) {
  try {
    const history = generateMockAlertHistory()

    return NextResponse.json({
      success: true,
      history,
      count: history.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching alert history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alert history' },
      { status: 500 }
    )
  }
}
