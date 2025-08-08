'use client'

import { ReactNode } from 'react'
import modal from '@/lib/wallet-config'

interface WalletProviderProps {
  children: ReactNode
}

/**
 * Provides a wrapper for rendering child components within the wallet context.
 *
 * @param children - The React elements to be rendered inside the provider
 */
export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <>
      {children}
    </>
  )
}
