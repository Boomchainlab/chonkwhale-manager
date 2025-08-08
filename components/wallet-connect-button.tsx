'use client'

import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'

export function WalletConnectButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
          {caipNetwork?.name || 'Solana'}
        </Badge>
        <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-3 py-2">
          <Wallet className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-mono text-gray-300">
            {formatAddress(address)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-700"
            onClick={handleCopyAddress}
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-700"
            onClick={() => window.open(`https://solscan.io/account/${address}`, '_blank')}
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => open()}
          className="border-gray-600 hover:bg-gray-800"
        >
          Manage
        </Button>
        {copied && (
          <span className="text-xs text-green-400 animate-fade-in">
            Copied!
          </span>
        )}
      </div>
    )
  }

  return (
    <Button
      onClick={() => open()}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  )
}
