import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock top whales data - in production, this would come from your database
    const mockWhales = [
      {
        walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        balance: 50000000,
        usdValue: 2500000,
        knownEntity: 'Binance Hot Wallet',
        tags: ['Exchange', 'Institutional'],
        rank: 1
      },
      {
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        balance: 35000000,
        usdValue: 1750000,
        knownEntity: 'Unknown Large Holder',
        tags: ['Whale', 'Long Term'],
        rank: 2
      },
      {
        walletAddress: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
        balance: 28000000,
        usdValue: 1400000,
        knownEntity: 'DeFi Protocol Treasury',
        tags: ['DeFi', 'Protocol'],
        rank: 3
      },
      {
        walletAddress: 'DnUsQnwNot38V9JbisNC18VHZkae1eKK5N2Dgy55pump',
        balance: 25000000,
        usdValue: 1250000,
        knownEntity: 'Token Creator',
        tags: ['Creator', 'Team'],
        rank: 4
      },
      {
        walletAddress: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
        balance: 22000000,
        usdValue: 1100000,
        knownEntity: 'Venture Capital Fund',
        tags: ['VC', 'Institutional'],
        rank: 5
      }
    ]

    return NextResponse.json({
      success: true,
      whales: mockWhales
    })
  } catch (error) {
    console.error('Error fetching top whales:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top whales' },
      { status: 500 }
    )
  }
}
