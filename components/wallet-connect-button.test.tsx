/**
 * Tests for WalletConnectButton
 * Library/Framework: React Testing Library with existing test runner (Jest or Vitest)
 * This suite verifies rendering states, address formatting, and user interactions (click -> open()).
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Detect mock functions depending on the runner
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runner: any = (global as any)
const useVi = typeof runner.vi !== 'undefined'
const mockFn = useVi ? runner.vi.fn : (runner.jest ? runner.jest.fn : (() => { throw new Error('No test runner mock found (jest/vi)') })())
const doMock = useVi ? runner.vi.mock : (runner.jest ? runner.jest.mock : (() => { throw new Error('No test runner mock found (jest/vi)') })())

// Prepare mutable mock states and functions referenced from the module factory
let mockOpen = mockFn()
let mockAccountState: { address?: string; isConnected: boolean } = { isConnected: false }

// Mock the external hooks from @reown/appkit/react
doMock('@reown/appkit/react', () => {
  return {
    useAppKit: () => ({ open: mockOpen }),
    useAppKitAccount: () => mockAccountState
  }
})

// Provide a minimal stub for the Button component in case the real UI lib is not available to the test runner.
// If your project already configures this import to resolve in tests, you can remove this mock.
let restoreButton: (() => void) | null = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@/components/ui/button')
} catch {
  doMock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  }))
  restoreButton = () => {
    if (useVi && runner.vi.resetModules) runner.vi.resetModules()
  }
}

// Import the component after mocks are established
import { WalletConnectButton } from './wallet-connect-button'

describe('WalletConnectButton', () => {
  afterAll(() => {
    if (restoreButton) restoreButton()
  })

  beforeEach(() => {
    // reset mock functions and default account state before each test
    mockOpen = mockFn()
    mockAccountState = { isConnected: false }
  })

  it('renders the "Connect Wallet" button when not connected', () => {
    render(<WalletConnectButton />)
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument()
  })

  it('invokes open() when clicking "Connect Wallet"', async () => {
    render(<WalletConnectButton />)
    const button = screen.getByRole('button', { name: /connect wallet/i })
    await userEvent.click(button)
    expect(mockOpen).toHaveBeenCalledTimes(1)
  })

  it('renders formatted address when connected with a valid address', () => {
    mockAccountState = { isConnected: true, address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12' }
    render(<WalletConnectButton />)
    // The component formats as first 4 chars + ... + last 4 chars
    expect(screen.getByText(/^0xAB\.\.\.EF12$/)).toBeInTheDocument()
  })

  it('clicking button while connected still triggers open()', async () => {
    mockAccountState = { isConnected: true, address: '0xDEADBEEF000000000000000000000000FEEDBEEF' }
    render(<WalletConnectButton />)
    const button = screen.getByRole('button')
    await userEvent.click(button)
    expect(mockOpen).toHaveBeenCalledTimes(1)
  })

  it('shows "Connect Wallet" if connected state is true but address is missing (edge case)', () => {
    mockAccountState = { isConnected: true, address: undefined }
    render(<WalletConnectButton />)
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument()
  })

  it('handles unusually short addresses gracefully in formatting (edge case)', () => {
    const shortAddr = '0x123' // shorter than 8 chars
    mockAccountState = { isConnected: true, address: shortAddr }
    render(<WalletConnectButton />)
    const expected = `${shortAddr.slice(0, 4)}...${shortAddr.slice(-4)}`
    expect(screen.getByText(expected)).toBeInTheDocument()
  })
})