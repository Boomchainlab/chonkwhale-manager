import { NextRequest, NextResponse } from 'next/server'

interface WhaleMetrics {
  totalWhaleVolume: {
    value: string
    change: string
    changeType: 'positive' | 'negative' | 'neutral'
  }
  activeWhales: {
    value: string
    change: string
    changeType: 'positive' | 'negative' | 'neutral'
  }
  whaleTransactions: {
    value: string
    change: string
    changeType: 'positive' | 'negative' | 'neutral'
  }
  buySellRatio: {
    value: string
    change: string
    changeType: 'positive' | 'negative' | 'neutral'
  }
  averageTransactionSize: {
    value: string
    change: string
    changeType: 'positive' | 'negative' | 'neutral'
  }
  topWhaleBalance: {
    value: string
    change: string
    changeType: 'positive' | 'negative' | 'neutral'
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'

    // Mock metrics data that would come from your database
    const mockMetrics: WhaleMetrics = {
      totalWhaleVolume: {
        value: '$12.4M',
        change: '+8.2%',
        changeType: 'positive'
      },
      activeWhales: {
        value: '247',
        change: '+12',
        changeType: 'positive'
      },
      whaleTransactions: {
        value: '1,834',
        change: '-3.1%',
        changeType: 'negative'
      },
      buySellRatio: {
        value: '1.34',
        change: '+0.12',
        changeType: 'positive'
      },
      averageTransactionSize: {
        value: '$67.5K',
        change: '+15.3%',
        changeType: 'positive'
      },
      topWhaleBalance: {
        value: '45.2M CHONK',
        change: '-2.1%',
        changeType: 'negative'
      }
    }

    // Simulate different data for different timeframes
    if (timeframe === '7d') {
      mockMetrics.totalWhaleVolume.value = '$89.2M'
      mockMetrics.totalWhaleVolume.change = '+12.7%'
      mockMetrics.activeWhales.value = '312'
      mockMetrics.activeWhales.change = '+28'
    } else if (timeframe === '30d') {
      mockMetrics.totalWhaleVolume.value = '$342.8M'
      mockMetrics.totalWhaleVolume.change = '+23.4%'
      mockMetrics.activeWhales.value = '456'
      mockMetrics.activeWhales.change = '+67'
    }

    return NextResponse.json({
      success: true,
      data: mockMetrics,
      timeframe,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching whale metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch whale metrics' },
      { status: 500 }
    )
  }
}
