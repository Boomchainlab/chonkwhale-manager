import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

// Get projectId from https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'your-project-id'

// Set up Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
})

// Create the modal
const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  projectId,
  networks: [solana, solanaTestnet, solanaDevnet],
  defaultNetwork: solana,
  metadata: {
    name: 'CHONK9K Whale Manager',
    description: 'Professional Solana Whale Tracking Platform',
    url: 'https://chonkpump.vercel.app',
    icons: ['https://chonkpump.vercel.app/icon.png']
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#00D2FF',
    '--w3m-color-mix-strength': 20
  }
})

export default modal
