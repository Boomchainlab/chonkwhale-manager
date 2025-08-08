import { NextRequest, NextResponse } from 'next/server'

interface TopWhale {
  walletAddress: string
  balance: number
  usdValue: number
  knownEntity?: string
  tags: string[]
  rank: number
  change24h: number
  transactions24h: number
  lastActivity: string
}

const generateMockWhales = (): TopWhale[] => {
  const wallets = [
    { address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', entity: 'Binance Hot Wallet', tags: ['Exchange', 'Hot Wallet'] },
    { address: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7Ybd4dfsEKvn', entity: 'Coinbase Custody', tags: ['Exchange', 'Custody'] },
    { address: 'EQuz4ybZaZbsGGckg2wVqzHBwlvFgvctdvQDiDJRKYmq', entity: 'Jump Trading', tags: ['Market Maker', 'Institutional'] },
    { address: 'FVwqJBjdxgKsQqZpVMdqGNq1wHjKjHgFdSaAsSdFgHjK', entity: undefined, tags: ['Whale', 'Early Investor'] },
    { address: 'GWxrJCkexhLtRrZqWNeqHOr2xIkKkIhGeSbBtTeFhIkL', entity: 'Alameda Research', tags: ['Trading Firm', 'Institutional'] },
    { address: 'HXyrKDlexiMsStQrZrZsWOq3yJlKlIjHfTcCuTgGiJlM', entity: undefined, tags: ['DeFi', 'Liquidity Provider'] },
    { address: 'IYzsLEmfyNtUrSsZsXPq4zKmMjLmNkJkGfUdDvHhKlMn', entity: 'Solana Foundation', tags: ['Foundation', 'Ecosystem'] },
    { address: 'JZAtMFogzOuVtTsZtYQr5LnNnLnOoKkHgGvEeIiJlMnO', entity: undefined, tags: ['Whale', 'HODLer'] },
    { address: 'KABuNGphzPvWtVsZuZRs6MoOoLpPpQqSsRrTtUuVvWwX', entity: 'FTX Cold Storage', tags: ['Exchange', 'Cold Storage'] },
    { address: 'LBCvOHqiQwXtYtZuZSs7NoOpPpQqSsRrTtUuVvWwXxYy', entity: undefined, tags: ['Whale', 'Active Trader'] }
  ]

  return wallets.map((wallet, index) => {
    const baseBalance = 50000000 - (index * 3000000)
    const balanceVariation = (Math.random() - 0.5) * 5000000
    const balance = Math.max(1000000, baseBalance + balanceVariation)
    const price = 0.0001 + Math.random() * 0.0001
    
    return {
      walletAddress: wallet.address,
      balance,
      usdValue: balance * price,
      knownEntity: wallet.entity,
      tags: wallet.tags,
      rank: index + 1,
      change24h: (Math.random() - 0.5) * 20,
      transactions24h: Math.floor(Math.random() * 30),
      lastActivity: `${Math.floor(Math.random() * 24)}h ago`
    }
  }).sort((a, b) => b.balance - a.balance)
}

export async function GET(request: NextRequest) {
  try {
    const whales = generateMockWhales()

    return NextResponse.json({
      success: true,
      whales,
      count: whales.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching top whales:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top whales' },
      { status: 500 }
    )
  }
}
