/**
 * Testing library/framework note:
 * These tests use Vitest + React Testing Library (JSDOM).
 * See vite.config.ts (test config) and vitest.setup.ts (jest-dom setup).
 */

import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock external modules and child components to keep tests focused on Dashboard behavior.
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

// Mock lucide-react icons as simple stubs to avoid SVG complexities
vi.mock('lucide-react', () => {
  const React = require('react')
  const Stub = (props: any) => React.createElement('svg', { 'data-testid': 'icon-stub', ...props })
  return {
    Activity: Stub,
    TrendingUp: Stub,
    Bell: Stub,
    Users: Stub,
    BarChart3: Stub,
    Settings: Stub,
  }
})

// Mock UI wrapper components from shadcn or local UI library
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...rest }: any) => <div data-testid="Card" {...rest}>{children}</div>,
  CardContent: ({ children, ...rest }: any) => <div data-testid="CardContent" {...rest}>{children}</div>,
  CardDescription: ({ children, ...rest }: any) => <div data-testid="CardDescription" {...rest}>{children}</div>,
  CardHeader: ({ children, ...rest }: any) => <div data-testid="CardHeader" {...rest}>{children}</div>,
  CardTitle: ({ children, ...rest }: any) => <div data-testid="CardTitle" {...rest}>{children}</div>,
}))

vi.mock('@/components/ui/tabs', () => {
  const React = require('react')
  const Tabs = ({ defaultValue, children, ...rest }: any) => {
    const [active, setActive] = React.useState(defaultValue)
    return (
      <div data-testid="Tabs" data-active={active} {...rest}>
        {React.Children.map(children, (child: any) => {
          if (child?.type?.displayName === 'TabsList') {
            return React.cloneElement(child, { onChange: setActive, active })
          }
          if (child?.type?.displayName === 'TabsContent') {
            if (child.props.value === active) return child
            return null
          }
          return child
        })}
      </div>
    )
  }
  const TabsList = ({ children, onChange, active, ...rest }: any) => (
    <div data-testid="TabsList" {...rest}>
      {React.Children.map(children, (child: any) =>
        React.cloneElement(child, { onChange, active }),
      )}
    </div>
  )
  TabsList.displayName = 'TabsList'
  const TabsTrigger = ({ value, children, onChange, active, ...rest }: any) => (
    <button
      type="button"
      data-testid={`TabsTrigger-${value}`}
      aria-selected={active === value}
      onClick={() => onChange?.(value)}
      {...rest}
    >
      {children}
    </button>
  )
  const TabsContent = ({ children, value, ...rest }: any) => (
    <div data-testid={`TabsContent-${value}`} {...rest}>
      {children}
    </div>
  )
  TabsContent.displayName = 'TabsContent'
  return { Tabs, TabsList, TabsTrigger, TabsContent }
})

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...rest }: any) => <span data-testid="Badge" {...rest}>{children}</span>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...rest }: any) => <button data-testid="Button" {...rest}>{children}</button>,
}))

// Mock feature components with visible markers so we can assert presence
vi.mock('@/components/whale-activity-feed', () => ({
  WhaleActivityFeed: () => <div data-testid="WhaleActivityFeed">WhaleActivityFeed</div>,
}))
vi.mock('@/components/whale-metrics', () => ({
  WhaleMetrics: () => <div data-testid="WhaleMetrics">WhaleMetrics</div>,
}))
vi.mock('@/components/alerts-panel', () => ({
  AlertsPanel: () => <div data-testid="AlertsPanel">AlertsPanel</div>,
}))
vi.mock('@/components/top-whales', () => ({
  TopWhales: () => <div data-testid="TopWhales">TopWhales</div>,
}))
vi.mock('@/components/price-chart', () => ({
  PriceChart: () => <div data-testid="PriceChart">PriceChart</div>,
}))
vi.mock('@/components/wallet-connect-button', () => ({
  WalletConnectButton: () => <button data-testid="WalletConnectButton">Connect Wallet</button>,
}))

// Import after mocks to ensure they apply correctly
import Dashboard from './page'
import { toast } from 'sonner'

describe('Dashboard (app/page.tsx)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  test('renders loading UI initially with spinner and connection message', () => {
    render(<Dashboard />)

    // Loading texts
    expect(screen.getByText('Loading CHONK9K Whale Manager...')).toBeInTheDocument()
    expect(screen.getByText('Connecting to Solana network')).toBeInTheDocument()

    // Ensure main header not present yet
    expect(screen.queryByText('CHONK9K')).not.toBeInTheDocument()
    expect(screen.queryByTestId('WhaleMetrics')).not.toBeInTheDocument()
  })

  test('transitions to connected UI after 2 seconds and shows success toast', async () => {
    render(<Dashboard />)

    // Still loading
    expect(screen.getByText('Loading CHONK9K Whale Manager...')).toBeInTheDocument()

    // Advance timers to trigger effect timer (2000ms)
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    // Main header appears
    expect(screen.getByText('CHONK9K')).toBeInTheDocument()

    // "Live" badge indicates connected status
    expect(screen.getByTestId('Badge')).toHaveTextContent(/Live/i)

    // Toast success called with expected message
    expect((toast.success as any).mock.calls.length).toBe(1)
    expect(toast.success).toHaveBeenCalledWith('Connected to Solana network')
  })

  test('renders expected tabs and default tab content (activity feed) when connected', async () => {
    render(<Dashboard />)

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    // Tabs triggers exist
    const activityTrigger = screen.getByRole('button', { name: /Live Feed/i })
    const whalesTrigger = screen.getByRole('button', { name: /Top Whales/i })
    const chartsTrigger = screen.getByRole('button', { name: /Analytics/i })
    const alertsTrigger = screen.getByRole('button', { name: /Alerts/i })
    expect(activityTrigger).toBeInTheDocument()
    expect(whalesTrigger).toBeInTheDocument()
    expect(chartsTrigger).toBeInTheDocument()
    expect(alertsTrigger).toBeInTheDocument()

    // Default tab should be "activity"
    expect(screen.getByTestId('WhaleActivityFeed')).toBeInTheDocument()
    expect(screen.queryByTestId('TopWhales')).not.toBeInTheDocument()
    expect(screen.queryByTestId('AlertsPanel')).not.toBeInTheDocument()

    // Active state a11y
    expect(activityTrigger).toHaveAttribute('aria-selected', 'true')
    expect(whalesTrigger).toHaveAttribute('aria-selected', 'false')
    expect(chartsTrigger).toHaveAttribute('aria-selected', 'false')
    expect(alertsTrigger).toHaveAttribute('aria-selected', 'false')
  })

  test('switches tabs to show Top Whales, Analytics, and Alerts content', async () => {
    render(<Dashboard />)
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    const user = userEvent.setup()

    // Switch to "whales"
    await user.click(screen.getByRole('button', { name: /Top Whales/i }))
    expect(screen.getByTestId('TopWhales')).toBeInTheDocument()
    expect(screen.queryByTestId('WhaleActivityFeed')).not.toBeInTheDocument()

    // Switch to "charts"
    await user.click(screen.getByRole('button', { name: /Analytics/i }))
    // PriceChart and Market Analysis card content area exist (mocked)
    expect(screen.getByTestId('PriceChart')).toBeInTheDocument()
    // The "Market Analysis" card content displays text "Advanced analytics coming soon..."
    expect(screen.getByText(/Advanced analytics coming soon.../i)).toBeInTheDocument()

    // Switch to "alerts"
    await user.click(screen.getByRole('button', { name: /Alerts/i }))
    expect(screen.getByTestId('AlertsPanel')).toBeInTheDocument()
  })

  test('renders wallet connect button and settings button in header when connected', async () => {
    render(<Dashboard />)
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByTestId('WalletConnectButton')).toBeInTheDocument()

    // Assert the Settings button is present
    const settingsButtonByRole = screen.getByRole('button', { name: /Settings/i })
    expect(settingsButtonByRole).toBeInTheDocument()

    // Also ensure our Button mock received the label
    const settingsButtonByTestId = screen.getByTestId('Button')
    expect(within(settingsButtonByTestId).getByText(/Settings/i)).toBeInTheDocument()
  })

  test('unmounts before timer completes - no success toast should fire', async () => {
    const { unmount } = render(<Dashboard />)

    // Unmount before the 2s timeout completes
    unmount()

    // Advance time; effect cleanup should have cleared the timer
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    expect(toast.success).not.toHaveBeenCalled()
  })

  test('renders welcome section and footer when connected', async () => {
    render(<Dashboard />)

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText('Professional Whale Tracking')).toBeInTheDocument()
    expect(
      screen.getByText(/Monitor large CHONK9K transactions, track whale movements/i),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/© 2024 CHONK9K Whale Manager\. Professional Solana whale tracking platform\./i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Built with Next\.js, Solana Web3\.js, and Reown AppKit/i),
    ).toBeInTheDocument()
  })
})