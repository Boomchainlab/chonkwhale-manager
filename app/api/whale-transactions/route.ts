import { NextRequest, NextResponse } from 'next/server'

interface WhaleTransaction {
  id: string
  walletAddress: string
  signature: string
  transactionType: 'buy' | 'sell' | 'transfer'
  tokenSymbol: string
  amount: number
  usdValue: number
  blockTime: string
  knownEntity?: string
}

// Mock whale transaction data
const generateMockTransaction = (): WhaleTransaction => {
  const types: ('buy' | 'sell' | 'transfer')[] = ['buy', 'sell', 'transfer']
  const type = types[Math.floor(Math.random() * types.length)]
  const amount = Math.floor(Math.random() * 5000000) + 100000
  const usdValue = amount * (0.0001 + Math.random() * 0.0002)
  
  const wallets = [
    '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7Ybd4dfsEKvn',
    'EQuz4ybZaZbsGGckg2wVqzHBwlvFgvctdvQDiDJRKYmq',
    'FVwqJBjdxgKsQqZpVMdqGNq1wHjKjHgFdSaAsSdFgHjK',
    'GWxrJCkexhLtRrZqWNeqHOr2xIkKkIhGeSbBtTeFhIkL'
  ]
  
  const knownEntities = ['Binance', 'Coinbase', 'FTX', 'Alameda Research', 'Jump Trading']
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    walletAddress: wallets[Math.floor(Math.random() * wallets.length)],
    signature: Math.random().toString(36).substr(2, 16) + Math.random().toString(36).substr(2, 16),
    transactionType: type,
    tokenSymbol: 'CHONK9K',
    amount,
    usdValue,
    blockTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    knownEntity: Math.random() > 0.7 ? knownEntities[Math.floor(Math.random() * knownEntities.length)] : undefined
  }
}

/**
 * Handles GET requests by returning a JSON response with a list of 20 mock whale transactions.
 *
 * The response includes a success flag, the sorted transactions array, and the total count. If an error occurs, returns a failure flag and an error message with a 500 status code.
 */
export async function GET(request: NextRequest) {
  try {
    // Generate mock transactions
    const transactions = Array.from({ length: 20 }, generateMockTransaction)
      .sort((a, b) => new Date(b.blockTime).getTime() - new Date(a.blockTime).getTime())

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length
    })
  } catch (error) {
    console.error('Error fetching whale transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch whale transactions' },
      { status: 500 }
    )
  }
}
