import { NextRequest, NextResponse } from 'next/server'

interface TopWhale {
  id: string
  rank: number
  walletAddress: string
  balance: string
  balanceUsd: string
  percentage: number
  knownEntity?: string
  tags: string[]
  lastActivity: string
  change24h: string
  changeType: 'positive' | 'negative' | 'neutral'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Mock top whales data
    const mockWhales: TopWhale[] = [
      {
        id: '1',
        rank: 1,
        walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        balance: '45,200,000',
        balanceUsd: '$4,520,000',
        percentage: 4.52,
        knownEntity: 'Binance Hot Wallet',
        tags: ['exchange', 'hot_wallet'],
        lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        change24h: '-2.1%',
        changeType: 'negative'
      },
      {
        id: '2',
        rank: 2,
        walletAddress: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7Ybd4dfsEKvn',
        balance: '32,800,000',
        balanceUsd: '$3,280,000',
        percentage: 3.28,
        knownEntity: 'Coinbase Custody',
        tags: ['exchange', 'custody'],
        lastActivity: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        change24h: '+1.5%',
        changeType: 'positive'
      },
      {
        id: '3',
        rank: 3,
        walletAddress: 'EQuz4ybZaZbsGGckg2wVqzHBwlvFgvctdvQDiDJRKYmq',
        balance: '28,500,000',
        balanceUsd: '$2,850,000',
        percentage: 2.85,
        knownEntity: 'Jump Trading',
        tags: ['market_maker', 'institutional'],
        lastActivity: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        change24h: '+4.2%',
        changeType: 'positive'
      },
      {
        id: '4',
        rank: 4,
        walletAddress: 'FVwqJBjdxgKsQqZpVMdqGNq1wHjKjHgFdSaAsSdFgHjK',
        balance: '21,000,000',
        balanceUsd: '$2,100,000',
        percentage: 2.10,
        tags: ['whale', 'early_investor'],
        lastActivity: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        change24h: '+0.8%',
        changeType: 'positive'
      },
      {
        id: '5',
        rank: 5,
        walletAddress: 'GWxrJCkexhLtRrZqWNeqHOr2xIkKkIhGeSbBtTeFhIkL',
        balance: '18,750,000',
        balanceUsd: '$1,875,000',
        percentage: 1.88,
        knownEntity: 'Alameda Research',
        tags: ['trading_firm', 'institutional'],
        lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        change24h: '-3.2%',
        changeType: 'negative'
      },
      {
        id: '6',
        rank: 6,
        walletAddress: 'HXyrKDlmNqPqZrWNeqHOr2xIkKkIhGeSbBtTeFhIkL',
        balance: '16,200,000',
        balanceUsd: '$1,620,000',
        percentage: 1.62,
        tags: ['whale', 'defi'],
        lastActivity: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        change24h: '+2.7%',
        changeType: 'positive'
      },
      {
        id: '7',
        rank: 7,
        walletAddress: 'IYzsLElnOrQrAsXOfqIPr3yJlLlJiHfTcCuUgGiJlM',
        balance: '14,800,000',
        balanceUsd: '$1,480,000',
        percentage: 1.48,
        knownEntity: 'FTX Recovery',
        tags: ['exchange', 'recovery'],
        lastActivity: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        change24h: '0.0%',
        changeType: 'neutral'
      },
      {
        id: '8',
        rank: 8,
        walletAddress: 'JZAtMFmoPs1rBtYPgqJQs4zKmMmKjIgUdDvVhHjKmN',
        balance: '13,500,000',
        balanceUsd: '$1,350,000',
        percentage: 1.35,
        tags: ['whale', 'hodler'],
        lastActivity: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        change24h: '+1.2%',
        changeType: 'positive'
      }
    ]

    // Apply pagination
    const paginatedWhales = mockWhales.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedWhales,
      total: mockWhales.length,
      limit,
      offset,
      hasMore: offset + limit < mockWhales.length
    })
  } catch (error) {
    console.error('Error fetching top whales:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top whales' },
      { status: 500 }
    )
  }
}
