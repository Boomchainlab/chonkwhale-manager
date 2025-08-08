import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
const CHONK_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MINT_TOKEN_ADDRESS || 'DnUsQnwNot38V9JbisNC18VHZkae1eKK5N2Dgy55pump'

// Mock whale wallets for demo - in production, these would come from your database
const WHALE_WALLETS = [
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
  'DnUsQnwNot38V9JbisNC18VHZkae1eKK5N2Dgy55pump'
]

export async function GET(request: NextRequest) {
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed')
    
    // Generate realistic mock transactions for demo
    const mockTransactions = [
      {
        id: '1',
        walletAddress: WHALE_WALLETS[0],
        signature: 'mock_signature_1',
        transactionType: 'buy' as const,
        tokenSymbol: 'CHONK',
        amount: 2500000,
        usdValue: 125000,
        blockTime: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        knownEntity: 'Large Holder'
      },
      {
        id: '2',
        walletAddress: WHALE_WALLETS[1],
        signature: 'mock_signature_2',
        transactionType: 'sell' as const,
        tokenSymbol: 'CHONK',
        amount: 1800000,
        usdValue: 90000,
        blockTime: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        knownEntity: 'Exchange Wallet'
      },
      {
        id: '3',
        walletAddress: WHALE_WALLETS[2],
        signature: 'mock_signature_3',
        transactionType: 'buy' as const,
        tokenSymbol: 'CHONK',
        amount: 3200000,
        usdValue: 160000,
        blockTime: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        knownEntity: 'High Frequency Trader'
      },
      {
        id: '4',
        walletAddress: WHALE_WALLETS[3],
        signature: 'mock_signature_4',
        transactionType: 'transfer' as const,
        tokenSymbol: 'CHONK',
        amount: 5000000,
        usdValue: 250000,
        blockTime: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
        knownEntity: 'Token Creator'
      }
    ]

    return NextResponse.json({
      success: true,
      transactions: mockTransactions
    })
  } catch (error) {
    console.error('Error fetching whale transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch whale transactions' },
      { status: 500 }
    )
  }
}
