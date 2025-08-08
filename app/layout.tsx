import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CHONK9K Whale Manager - Professional Solana Whale Tracking',
  description: 'Advanced whale tracking and analytics platform for Solana blockchain. Monitor large transactions, set alerts, and track whale activity in real-time.',
  keywords: 'solana, whale tracking, crypto analytics, blockchain monitoring, CHONK token',
  authors: [{ name: 'CHONK9K Team' }],
  openGraph: {
    title: 'CHONK9K Whale Manager',
    description: 'Professional Solana whale tracking platform',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CHONK9K Whale Manager',
    description: 'Professional Solana whale tracking platform',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
