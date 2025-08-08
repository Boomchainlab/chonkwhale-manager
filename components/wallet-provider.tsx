'use client'

import { ReactNode } from 'react'
import modal from '@/lib/wallet-config'

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <>
      {children}
    </>
  )
}
