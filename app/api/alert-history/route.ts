import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock alert history - in production, this would come from your database
    const mockHistory = [
      {
        id: '1',
        alertName: 'Large Buy Alert',
        message: 'Whale transaction detected: $125,000 buy order',
        severity: 'high',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        metadata: {
          walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          amount: 125000,
          transactionType: 'buy'
        }
      },
      {
        id: '2',
        alertName: 'High Volume Alert',
        message: 'Volume threshold exceeded: $500,000+ in last hour',
        severity: 'medium',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        metadata: {
          volume: 750000,
          timeframe: '1h'
        }
      },
      {
        id: '3',
        alertName: 'Large Sell Alert',
        message: 'Major sell-off detected: $200,000 sell order',
        severity: 'high',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        metadata: {
          walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
          amount: 200000,
          transactionType: 'sell'
        }
      }
    ]

    return NextResponse.json({
      success: true,
      history: mockHistory
    })
  } catch (error) {
    console.error('Error fetching alert history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alert history' },
      { status: 500 }
    )
  }
}
