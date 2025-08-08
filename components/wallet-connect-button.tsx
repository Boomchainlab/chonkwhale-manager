'use client'

import { Button } from '@/components/ui/button'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { Wallet, LogOut } from 'lucide-react'

export function WalletConnectButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  const handleConnect = () => {
    open()
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <Button 
        onClick={handleConnect}
        variant="outline" 
        className="flex items-center gap-2"
      >
        <Wallet className="h-4 w-4" />
        {formatAddress(address)}
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleConnect}
      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  )
}
