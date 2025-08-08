/**
 * Tests for TopWhales component.
 *
 * Testing stack: Jest + React Testing Library (RTL)
 * - Aligns with common Next.js + RTL patterns
 * - Uses jest.useFakeTimers() for interval verification
 * - Mocks Math.random for deterministic data generation
 *
 * Scenarios covered:
 * - Renders header/title and table structure
 * - Generates 20 rows of whale data
 * - Positive change shows TrendingUp icon and green text with '+' sign
 * - Negative change shows TrendingDown icon and red text with '-' sign
 * - Balance formatting shows M/K suffixes
 * - Percentage formatting shows 2 decimals with '%'
 * - Last activity shows 'xh ago'
 * - Clicking ExternalLink button opens solscan account URL for that wallet
 * - Interval is set to 30s and cleared on unmount
 */

import React from 'react'
import { render, screen, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'

// Try to import the component using possible paths.
// If your project stores this component elsewhere, adjust the import path accordingly.
// Preferred path using alias:
let TopWhalesComp: any
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  TopWhalesComp = require('@/components/top-whales')?.TopWhales ?? require('@/components/top-whales').default
} catch {
  try {
    // Fallback to relative import if alias isn't configured in tests
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    TopWhalesComp = require('./top-whales')?.TopWhales ?? require('./top-whales').default
  } catch {
    // If still not found, try a few other common paths
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      TopWhalesComp = require('../components/top-whales')?.TopWhales ?? require('../components/top-whales').default
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      TopWhalesComp = require('./TopWhales')?.TopWhales ?? require('./TopWhales').default
    }
  }
}

const TopWhales: React.FC = TopWhalesComp

describe('TopWhales', () => {
  const realOpen = window.open
  const realRandom = Math.random

  beforeEach(() => {
    jest.useFakeTimers()
    // Default Math.random to a high constant to produce positive change
    // and deterministic outputs. 0.9 yields:
    // - balance ~ 10.0M
    // - percentage ~ 4.60%
    // - change +8.0%
    // - lastActivity 21h ago
    ;(Math.random as any) = jest.fn(() => 0.9)
    window.open = jest.fn()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    ;(Math.random as any) = realRandom
    window.open = realOpen
    cleanup()
  })

  function getAllTableRowsInBody() {
    // TableBody rows are under tbody > tr (excluding header)
    // Using role row finds all rows including header, so we constrain to tbody
    const tbody = document.querySelector('tbody')
    if (!tbody) return []
    return Array.from(tbody.querySelectorAll('tr'))
  }

  test('renders heading and description', async () => {
    render(<TopWhales />)
    expect(await screen.findByText('Top CHONK9K Whales')).toBeInTheDocument()
    expect(screen.getByText('Largest token holders and their recent activity')).toBeInTheDocument()
  })

  test('generates 20 whale rows in the table', async () => {
    render(<TopWhales />)
    // Wait for the async state update triggered in useEffect
    const rows = await screen.findAllByRole('row')
    // First row is header, others are data rows. But to be robust, get tbody rows only.
    const bodyRows = getAllTableRowsInBody()
    expect(bodyRows.length).toBe(20)
  })

  test('displays formatted values and positive trend correctly (with Math.random = 0.9)', async () => {
    render(<TopWhales />)
    const bodyRows = getAllTableRowsInBody()
    expect(bodyRows.length).toBe(20)

    // Inspect the first row for expected formatted values
    const first = bodyRows[0]
    const utils = within(first)

    // Rank appears prefixed with '#'
    expect(utils.getByText(/^#\d+$/)).toBeInTheDocument()

    // Wallet badge shows "xxxx...xxxx" (4 chars ... 4 chars)
    const walletBadge = utils.getByText(/^[a-z0-9]{4}\.\.\.[a-z0-9]{4}$/i)
    expect(walletBadge).toBeInTheDocument()

    // Balance formatted as "10.0M CHONK9K" given Math.random = 0.9
    expect(utils.getByText('10.0M CHONK9K')).toBeInTheDocument()

    // Percentage formatted as "4.60%"
    expect(utils.getByText('4.60%')).toBeInTheDocument()

    // Positive change "+8.0%" with green text and TrendingUp icon class
    expect(utils.getByText('+8.0%')).toBeInTheDocument()
    const upIcon = first.querySelector('svg.text-green-400')
    expect(upIcon).toBeTruthy()
    const posSpan = first.querySelector('span.text-green-400')
    expect(posSpan?.textContent).toBe('+8.0%')

    // Last activity "21h ago"
    expect(utils.getByText('21h ago')).toBeInTheDocument()
  })

  test('displays negative trend correctly (with Math.random = 0.1)', async () => {
    ;(Math.random as jest.Mock).mockImplementation(() => 0.1)

    render(<TopWhales />)

    const bodyRows = getAllTableRowsInBody()
    // Wait for the async effect to populate; if not yet ready, wait via title presence
    await screen.findByText('Top CHONK9K Whales')

    // Re-select after population
    const populatedRows = getAllTableRowsInBody()
    expect(populatedRows.length).toBe(20)

    const first = populatedRows[0]
    // Negative change: (0.1 - 0.5) * 20 = -8.0%
    const negSpan = first.querySelector('span.text-red-400')
    expect(negSpan?.textContent).toBe('-8.0%')
    const downIcon = first.querySelector('svg.text-red-400')
    expect(downIcon).toBeTruthy()

    // Balance with 0.1 => 2.0M
    expect(within(first).getByText('2.0M CHONK9K')).toBeInTheDocument()

    // Percentage with 0.1 => 0.60%
    expect(within(first).getByText('0.60%')).toBeInTheDocument()

    // Last activity with 0.1 => 2h ago
    expect(within(first).getByText('2h ago')).toBeInTheDocument()
  })

  test('ExternalLink button opens solscan with the correct wallet address', async () => {
    render(<TopWhales />)
    const bodyRows = getAllTableRowsInBody()
    await screen.findByText('Top CHONK9K Whales')

    const first = getAllTableRowsInBody()[0]
    const utils = within(first)

    // Extract the wallet text from the badge
    const walletTextEl = utils.getByText(/^[a-z0-9]{4}\.\.\.[a-z0-9]{4}$/i)
    const walletMasked = walletTextEl.textContent || ''

    // The component constructs URL directly with the wallet string shown in badge
    const expectedUrl = `https://solscan.io/account/${walletMasked}`

    // Click the ExternalLink button
    const button = first.querySelector('button')
    expect(button).toBeTruthy()
    await userEvent.click(button as Element)

    expect(window.open).toHaveBeenCalledWith(expectedUrl, '_blank')
  })

  test('sets an interval to refresh data every 30 seconds and clears it on unmount', async () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval')
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')

    const { unmount } = render(<TopWhales />)
    await screen.findByText('Top CHONK9K Whales')

    expect(setIntervalSpy).toHaveBeenCalledTimes(1)
    const call = setIntervalSpy.mock.calls[0]
    expect(typeof call[0]).toBe('function')
    expect(call[1]).toBe(30000)

    // Advance timers to ensure the callback is safe to call
    act(() => {
      jest.advanceTimersByTime(30000)
    })

    // Unmount triggers cleanup
    unmount()
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1)

    setIntervalSpy.mockRestore()
    clearIntervalSpy.mockRestore()
  })
})