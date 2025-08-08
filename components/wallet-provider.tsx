'use client'

import { createContext, useContext, ReactNode } from 'react'
import { modal } from '@/lib/wallet-config'

const WalletContext = createContext(modal)

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WalletContext.Provider value={modal}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
