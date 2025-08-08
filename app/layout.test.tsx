/**
 * Tests for app/layout.tsx
 *
 * Assumed testing stack:
 * - Jest as the test runner
 * - @testing-library/react for rendering and queries (jsdom environment)
 *
 * If the repository uses a different framework (e.g., Vitest), the below imports and mocks may need slight adjustments:
 * - Replace `jest.mock` with `vi.mock`
 * - Ensure a jsdom-like environment is configured
 */

import React from 'react'

// We import the module under test lazily within tests after setting up mocks to ensure mocks are applied.
import { render, screen } from '@testing-library/react'

// Mock next/font/google to return a deterministic className for Inter
jest.mock('next/font/google', () => {
  return {
    Inter: jest.fn(() => ({ className: 'inter-font-mock' })),
  }
})

// Mock providers and Toaster to simple test-friendly components
jest.mock('@/components/theme-provider', () => {
  return {
    ThemeProvider: ({ children, ...props }: any) => (
      <div data-testid="ThemeProvider" data-props={JSON.stringify(props)}>{children}</div>
    ),
  }
})

jest.mock('@/components/wallet-provider', () => {
  return {
    WalletProvider: ({ children, ...props }: any) => (
      <div data-testid="WalletProvider" data-props={JSON.stringify(props)}>{children}</div>
    ),
  }
})

jest.mock('@/components/ui/sonner', () => {
  return {
    Toaster: (props: any) => <div data-testid="Toaster" data-props={JSON.stringify(props)} />,
  }
})

// Mock globals.css import (Next.js typically allows CSS imports; in Jest we stub to avoid issues)
jest.mock('./globals.css', () => ({}), { virtual: true })

describe('app/layout.tsx', () => {
  describe('metadata export', () => {
    // Dynamically import to ensure metadata matches the expected object
    test('exposes expected metadata fields and values', async () => {
      const mod = await import('./layout')
      expect(mod.metadata).toBeDefined()

      // Validate shape and critical content
      expect(mod.metadata).toMatchObject({
        title: 'CHONK9K Whale Manager',
        description: 'Professional Solana Whale Tracking Platform',
        icons: {
          icon: '/placeholder-logo.png',
        },
        generator: 'v0.dev',
      })

      // Extra assertions to avoid regressions of keys
      expect(Object.keys(mod.metadata)).toEqual(
        expect.arrayContaining(['title', 'description', 'icons', 'generator'])
      )
      expect(mod.metadata.icons).toBeDefined()
      expect((mod.metadata as any).icons.icon).toBe('/placeholder-logo.png')
    })
  })

  describe('RootLayout component', () => {
    test('renders the basic html structure with lang=en and suppressHydrationWarning', async () => {
      const mod = await import('./layout')
      const { container } = render(
        <mod.default>
          <div data-testid="child">child</div>
        </mod.default>
      )

      const htmlEl = container.querySelector('html')
      expect(htmlEl).toBeTruthy()
      expect(htmlEl?.getAttribute('lang')).toBe('en')
      // suppressHydrationWarning presence (boolean attribute)
      // vDOM renders it as an attribute key without value in SSR; in client it may be "true"
      // We check presence rather than exact value for stability.
      expect(htmlEl?.hasAttribute('suppressHydrationWarning')).toBe(true)

      const bodyEl = container.querySelector('body')
      expect(bodyEl).toBeTruthy()
      // Confirm Inter font applied via className from the mock
      expect(bodyEl?.getAttribute('class')).toContain('inter-font-mock')

      // Children should be rendered inside providers
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    test('wraps children with ThemeProvider and WalletProvider, and includes Toaster', async () => {
      const mod = await import('./layout')
      render(
        <mod.default>
          <div data-testid="content">content</div>
        </mod.default>
      )

      // Providers and Toaster presence
      const themeProvider = screen.getByTestId('ThemeProvider')
      const walletProvider = screen.getByTestId('WalletProvider')
      const toaster = screen.getByTestId('Toaster')

      expect(themeProvider).toBeInTheDocument()
      expect(walletProvider).toBeInTheDocument()
      expect(toaster).toBeInTheDocument()

      // Validate ThemeProvider props per implementation
      const themeProps = JSON.parse(themeProvider.getAttribute('data-props') || '{}')
      expect(themeProps).toMatchObject({
        attribute: 'class',
        defaultTheme: 'dark',
        enableSystem: true,
        disableTransitionOnChange: true,
      })
    })

    test('renders children exactly once within WalletProvider', async () => {
      const mod = await import('./layout')
      render(
        <mod.default>
          <div data-testid="unique-child">hello</div>
        </mod.default>
      )
      const walletProvider = screen.getByTestId('WalletProvider')
      // Child should be within WalletProvider subtree
      const child = screen.getByTestId('unique-child')
      expect(child).toBeInTheDocument()
      // Ensure only one child instance rendered
      expect(screen.getAllByTestId('unique-child')).toHaveLength(1)
      // Check DOM containment
      expect(walletProvider.contains(child)).toBe(true)
    })

    test('is resilient to null children', async () => {
      const mod = await import('./layout')
      const { container } = render(<mod.default>{null as any}</mod.default>)
      // Still renders structure and toaster/providers
      expect(container.querySelector('html')).toBeTruthy()
      expect(screen.getByTestId('ThemeProvider')).toBeInTheDocument()
      expect(screen.getByTestId('WalletProvider')).toBeInTheDocument()
      expect(screen.getByTestId('Toaster')).toBeInTheDocument()
    })
  })
})