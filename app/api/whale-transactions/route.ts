import { NextRequest, NextResponse } from 'next/server'

interface WhaleTransaction {
  id: string
  signature: string
  wallet: string
  type: 'buy' | 'sell' | 'transfer'
  amount: number
  usdValue: number
  timestamp: string
  priceImpact?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const wallet = searchParams.get('wallet')
    const type = searchParams.get('type')

    // Mock data for whale transactions
    const mockTransactions: WhaleTransaction[] = [
      {
        id: '1',
        signature: '5j7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9',
        wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        type: 'buy',
        amount: 1250000,
        usdValue: 125000,
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        priceImpact: 2.3
      },
      {
        id: '2',
        signature: '4i6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z',
        wallet: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7Ybd4dfsEKvn',
        type: 'sell',
        amount: 890000,
        usdValue: 89000,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        priceImpact: -1.8
      },
      {
        id: '3',
        signature: '3h5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y',
        wallet: 'EQuz4ybZaZbsGGckg2wVqzHBwlvFgvctdvQDiDJRKYmq',
        type: 'buy',
        amount: 2100000,
        usdValue: 210000,
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        priceImpact: 4.1
      },
      {
        id: '4',
        signature: '2g4H5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X',
        wallet: 'FVwqJBjdxgKsQqZpVMdqGNq1wHjKjHgFdSaAsSdFgHjK',
        type: 'transfer',
        amount: 750000,
        usdValue: 75000,
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        signature: '1f3G4H5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W',
        wallet: 'GWxrJCkexhLtRrZqWNeqHOr2xIkKkIhGeSbBtTeFhIkL',
        type: 'sell',
        amount: 1800000,
        usdValue: 180000,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        priceImpact: -3.2
      }
    ]

    let filteredTransactions = mockTransactions

    // Filter by wallet if specified
    if (wallet) {
      filteredTransactions = filteredTransactions.filter(tx => tx.wallet === wallet)
    }

    // Filter by type if specified
    if (type && ['buy', 'sell', 'transfer'].includes(type)) {
      filteredTransactions = filteredTransactions.filter(tx => tx.type === type)
    }

    // Apply limit
    const limitedTransactions = filteredTransactions.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: limitedTransactions,
      total: filteredTransactions.length,
      limit
    })
  } catch (error) {
    console.error('Error fetching whale transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch whale transactions' },
      { status: 500 }
    )
  }
}
