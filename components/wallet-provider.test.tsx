
// ---------- Tests ----------
/**
 * Test suite for WalletProvider and useWallet
 * Testing library/framework: Jest + React Testing Library
 */
import React, { PropsWithChildren } from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the wallet-config to control the `modal` object provided by context
jest.mock('@/lib/wallet-config', () => {
  // Provide a test double that can be asserted against
  const fakeModal = {
    open: jest.fn(),
    close: jest.fn(),
    isOpen: false,
    name: 'TestModal',
  }
  return { modal: fakeModal }
})

// Provide a simple consumer component to assert hook behavior in a render
function WalletConsumerDisplay() {
  const wallet = useWallet()
  return (
    <div>
      <span data-testid="wallet-name">{wallet?.name ?? 'no-name'}</span>
      <span data-testid="wallet-open-state">{String(wallet?.isOpen)}</span>
      <button onClick={() => wallet?.open()} data-testid="open-btn">open</button>
      <button onClick={() => wallet?.close()} data-testid="close-btn">close</button>
    </div>
  )
}

describe('WalletProvider', () => {
  test('WalletProvider provides modal via context to descendants (happy path)', () => {
    render(
      <WalletProvider>
        <WalletConsumerDisplay />
      </WalletProvider>
    )

    expect(screen.getByTestId('wallet-name')).toHaveTextContent('TestModal')
    expect(screen.getByTestId('wallet-open-state')).toHaveTextContent('false')
  })

  test('useWallet returns the same instance across rerenders (stability)', () => {
    const { rerender } = render(
      <WalletProvider>
        <WalletConsumerDisplay />
      </WalletProvider>
    )

    const firstName = screen.getByTestId('wallet-name').textContent
    rerender(
      <WalletProvider>
        <WalletConsumerDisplay />
      </WalletProvider>
    )
    const secondName = screen.getByTestId('wallet-name').textContent

    expect(firstName).toBe('TestModal')
    expect(secondName).toBe('TestModal')
  })

  test('exposes functions from modal and they are callable by consumers', () => {
    // Access the mocked instance used by the module mock
    const { modal } = jest.requireMock('@/lib/wallet-config') as { modal: any }

    render(
      <WalletProvider>
        <WalletConsumerDisplay />
      </WalletProvider>
    )

    screen.getByTestId('open-btn').click()
    screen.getByTestId('close-btn').click()

    expect(modal.open).toHaveBeenCalledTimes(1)
    expect(modal.close).toHaveBeenCalledTimes(1)
  })
})

describe('useWallet', () => {
  test('returns default context value if used without provider (edge case)', () => {
    // The implementation uses createContext(modal) with a default value
    // Therefore, using the hook without a Provider should return that default.
    // We still render the consumer without wrapping it to validate behavior.
    render(<WalletConsumerDisplay />)
    expect(screen.getByTestId('wallet-name')).toHaveTextContent('TestModal')
  })

  test('isolation between tests: a different mocked modal is used if remocked', async () => {
    // Reconfigure the mock for a single test to ensure isolation and verify the provider
    // delivers the new value.
    jest.resetModules()
    jest.doMock('@/lib/wallet-config', () => {
      const altModal = {
        open: jest.fn(),
        close: jest.fn(),
        isOpen: true,
        name: 'AltModal',
      }
      return { modal: altModal }
    })

    // Re-import subjects under test to pick up the new mock module instance
    const { WalletProvider: AltProvider, useWallet: useAltWallet } = await import('./wallet-provider.test')

    function AltConsumer() {
      const wallet = useAltWallet()
      return (
        <div>
          <span data-testid="wallet-name">{wallet?.name ?? 'no-name'}</span>
          <span data-testid="wallet-open-state">{String(wallet?.isOpen)}</span>
        </div>
      )
    }

    render(
      <AltProvider>
        <AltConsumer />
      </AltProvider>
    )

    expect(screen.getByTestId('wallet-name')).toHaveTextContent('AltModal')
    expect(screen.getByTestId('wallet-open-state')).toHaveTextContent('true')
  })
})
