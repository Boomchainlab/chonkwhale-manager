// Placeholder to host tests for wallet-config
export {}

/**
 * Tests for wallet-config modal creation
 *
 * Framework assumption: Jest (or Vitest-compatible)
 * We mock all external dependencies to assert correct wiring and configuration.
 */

import type { MockedFunction } from 'jest-mock'

// Mock external modules
jest.mock('@reown/appkit', () => {
  return {
    createAppKit: jest.fn(() => ({ __mockModal: true }))
  }
})

jest.mock('@reown/appkit-adapter-solana/react', () => {
  return {
    SolanaAdapter: jest.fn(function (this: any, opts: any) {
      // emulate class instantiation
      return { __mockAdapter: true, opts }
    })
  }
})

jest.mock('@reown/appkit/networks', () => {
  // provide unique sentinels to verify exact array content
  return {
    solana: { id: 'solana-mainnet' },
    solanaTestnet: { id: 'solana-testnet' },
    solanaDevnet: { id: 'solana-devnet' }
  }
})

jest.mock('@solana/wallet-adapter-wallets', () => {
  return {
    PhantomWalletAdapter: jest.fn(function (this: any) {
      return { name: 'PhantomWalletAdapter' }
    }),
    SolflareWalletAdapter: jest.fn(function (this: any) {
      return { name: 'SolflareWalletAdapter' }
    })
  }
})

describe('wallet-config modal configuration', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...ORIGINAL_ENV }
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  it('creates a modal with expected adapters, networks, metadata, features, and env-driven projectId (happy path)', async () => {
    // Arrange
    const { createAppKit } = jest.requireMock('@reown/appkit') as {
      createAppKit: MockedFunction<(...args: any[]) => any>
    }
    const { SolanaAdapter } = jest.requireMock('@reown/appkit-adapter-solana/react') as {
      SolanaAdapter: MockedFunction<any>
    }
    const { solana, solanaTestnet, solanaDevnet } = jest.requireMock('@reown/appkit/networks')
    const { PhantomWalletAdapter, SolflareWalletAdapter } = jest.requireMock('@solana/wallet-adapter-wallets')

    process.env.NEXT_PUBLIC_REOWN_PROJECT_ID = 'env-project-id-123'

    // Act
    // Import the module under test after setting env so initializer code sees the env var
    const mod = await import('./wallet-config.test') // using relative path to this file

    // Assert exported symbols
    expect(mod).toHaveProperty('modal')
    expect(mod.default).toBe(mod.modal)

    // Assert adapters and wallets setup
    expect(SolanaAdapter).toHaveBeenCalledTimes(1)
    const solAdapterArgs = (SolanaAdapter as jest.Mock).mock.calls[0]?.[0]
    expect(solAdapterArgs).toBeDefined()
    expect(Array.isArray(solAdapterArgs.wallets)).toBe(true)
    // Validate that wallets are instantiated from the correct classes
    expect(PhantomWalletAdapter).toHaveBeenCalledTimes(1)
    expect(SolflareWalletAdapter).toHaveBeenCalledTimes(1)

    // Assert createAppKit called with proper configuration
    expect(createAppKit).toHaveBeenCalledTimes(1)
    const cfg = (createAppKit as jest.Mock).mock.calls[0]?.[0]
    expect(cfg).toBeDefined()

    // Adapters should include the constructed solana adapter instance
    expect(Array.isArray(cfg.adapters)).toBe(true)
    // Since our SolanaAdapter mock returns a simple object, ensure one element exists
    expect(cfg.adapters.length).toBe(1)

    // Networks expectation
    expect(cfg.networks).toEqual([solana, solanaTestnet, solanaDevnet])

    // Metadata expectation
    expect(cfg.metadata).toEqual({
      name: 'CHONK9K Whale Manager',
      description: 'Professional Solana Whale Tracking Platform',
      url: 'https://chonkpump.vercel.app',
      icons: ['https://chonkpump.vercel.app/icon.png']
    })

    // Features expectation
    expect(cfg.features).toEqual({
      analytics: true,
      email: false,
      socials: false
    })

    // ProjectId from env
    expect(cfg.projectId).toBe('env-project-id-123')

    // Return value mapping to export
    expect(mod.modal).toEqual({ __mockModal: true })
  })

  it('falls back to default projectId when env var is missing', async () => {
    const { createAppKit } = jest.requireMock('@reown/appkit') as {
      createAppKit: MockedFunction<(...args: any[]) => any>
    }

    delete process.env.NEXT_PUBLIC_REOWN_PROJECT_ID

    // Fresh import to re-run module initialization with modified env
    const mod = await import('./wallet-config.test?case=default') // query to bypass module cache key
    expect(mod).toHaveProperty('modal')

    const cfg = (createAppKit as jest.Mock).mock.calls.at(-1)?.[0]
    expect(cfg).toBeDefined()
    expect(cfg.projectId).toBe('your-project-id')
  })

  it('handles unexpected wallet instantiation errors gracefully by surfacing thrown error during module import', async () => {
    // Here we make PhantomWalletAdapter throw to ensure our module import propagates errors.
    jest.doMock('@solana/wallet-adapter-wallets', () => {
      return {
        PhantomWalletAdapter: jest.fn(() => {
          throw new Error('Phantom construction failed')
        }),
        SolflareWalletAdapter: jest.fn(function (this: any) {
          return { name: 'SolflareWalletAdapter' }
        })
      }
    })

    await expect(import('./wallet-config.test?case=wallet-error')).rejects.toThrow('Phantom construction failed')
  })

  it('passes a well-formed wallets array to SolanaAdapter options', async () => {
    const { SolanaAdapter } = jest.requireMock('@reown/appkit-adapter-solana/react') as {
      SolanaAdapter: MockedFunction<any>
    }
    const { PhantomWalletAdapter, SolflareWalletAdapter } = jest.requireMock('@solana/wallet-adapter-wallets')

    // Re-import to capture fresh call args
    await import('./wallet-config.test?case=wallets-array')

    expect(SolanaAdapter).toHaveBeenCalledTimes(1)
    const opts = (SolanaAdapter as jest.Mock).mock.calls[0]?.[0]
    expect(opts).toBeDefined()
    expect(Array.isArray(opts.wallets)).toBe(true)
    expect(opts.wallets).toHaveLength(2)

    // Instances were created
    expect(PhantomWalletAdapter).toHaveBeenCalled()
    expect(SolflareWalletAdapter).toHaveBeenCalled()
  })

  it('ensures networks include mainnet, testnet, and devnet in that order', async () => {
    const { solana, solanaTestnet, solanaDevnet } = jest.requireMock('@reown/appkit/networks')

    await import('./wallet-config.test?case=networks-order')

    // Verify against last call args of createAppKit
    const { createAppKit } = jest.requireMock('@reown/appkit') as {
      createAppKit: MockedFunction<(...args: any[]) => any>
    }
    const cfg = (createAppKit as jest.Mock).mock.calls.at(-1)?.[0]
    expect(cfg.networks).toEqual([solana, solanaTestnet, solanaDevnet])
  })
})