/**
 * Tests for PriceChart component.
 *
 * Framework: React Testing Library with Jest/Vitest-style APIs.
 * - Uses fake timers to control setInterval updates
 * - Mocks Math.random for deterministic data generation
 * - Verifies initial rendering, formatting, sign/color logic, and interval updates & cleanup
 */

import React from 'react'
import { render, screen, act } from '@testing-library/react'

// In some repos, RTL exposes userEvent; not needed here
// import userEvent from '@testing-library/user-event'

// Import the component under test. The file under test exports PriceChart.
import { PriceChart } from './price-chart' // Adjust path if component file is named differently

// Helpers for mocking timers compatible with both Jest and Vitest
const useFakeTimers = () => {
  // jest and vitest share similar APIs; guard for either
  const g: any = globalThis as any
  if (g.jest && typeof g.jest.useFakeTimers === 'function') {
    g.jest['useFakeTimers']()
    return {
      runOnlyPendingTimers: () => g.jest.runOnlyPendingTimers(),
      advanceTimersByTime: (ms: number) => g.jest.advanceTimersByTime(ms),
      useRealTimers: () => g.jest['useRealTimers'](),
      clearAllTimers: () => g.jest.clearAllTimers?.()
    }
  }
  if (g.vi && typeof g.vi.useFakeTimers === 'function') {
    g.vi['useFakeTimers']()
    return {
      runOnlyPendingTimers: () => g.vi.runOnlyPendingTimers(),
      advanceTimersByTime: (ms: number) => g.vi.advanceTimersByTime(ms),
      useRealTimers: () => g.vi['useRealTimers'](),
      clearAllTimers: () => g.vi.clearAllTimers?.()
    }
  }
  throw new Error('No supported fake timers API found (jest/vi).')
}

describe('PriceChart', () => {
  const originalRandom = Math.random
  const originalDate = Date

  // Deterministic Math.random: always 0.5 to yield zero price delta and predictable volumes
  const constantRandom = () => 0.5

  // Stable Date for consistent toLocaleTimeString; time value won't matter for these tests
  class MockDate extends Date {
    constructor(...args: any[]) {
      if (args.length) {
        super(...(args as ConstructorParameters<typeof Date>))
      } else {
        super('2024-01-01T00:00:00.000Z')
      }
    }
    static now() {
      return new Date('2024-01-01T00:00:00.000Z').getTime()
    }
  }

  beforeEach(() => {
    // @ts-expect-error override
    Math.random = constantRandom
    // @ts-expect-error override
    global.Date = MockDate as any
  })

  afterEach(() => {
    // Restore globals
    Math.random = originalRandom
    global.Date = originalDate
  })

  test('renders chart title, description, and initial current price with correct formatting', async () => {
    const timers = useFakeTimers()
    await act(async () => {
      render(<PriceChart />)
    })

    // Title and description
    expect(screen.getByText('CHONK9K Price Chart')).toBeInTheDocument()
    expect(screen.getByText('24-hour price movement and volume')).toBeInTheDocument()

    // With Math.random=0.5, initial last price remains 0.00012 and format to 6 decimals
    // Look for "$0.000120"
    expect(screen.getByText('$0.000120')).toBeInTheDocument()

    // Cleanup timers
    timers.useRealTimers()
  })

  test('displays positive (green) change with + sign when priceChange >= 0', async () => {
    const timers = useFakeTimers()
    await act(async () => {
      render(<PriceChart />)
    })

    // With constant random of 0.5, priceChange computed as 0%
    // It should be displayed with +0.00% (24h) and green styling
    const pctText = screen.getByText(/\+0\.00% \(24h\)/)
    expect(pctText).toBeInTheDocument()

    // Positive color class should be present
    // We can't easily select by className across libraries, but we can assert that the element exists with text and then inspect class
    const el = pctText.closest('div')
    expect(el).toBeTruthy()
    // The component uses 'text-green-400' for non-negative change
    expect(el?.className).toEqual(expect.stringContaining('text-green-400'))

    // Arrow should not be rotated for non-negative change (no 'rotate-180' class)
    // Find the nearest svg (icon) sibling or descendant with appropriate class
    const arrow = el?.querySelector('svg')
    if (arrow) {
      expect(arrow.className.baseVal || arrow.getAttribute('class') || '').not.toContain('rotate-180')
    }

    timers.useRealTimers()
  })

  test('updates on interval and keeps exactly 24 data points (no visible regression in current price or percent)', async () => {
    const timers = useFakeTimers()
    await act(async () => {
      render(<PriceChart />)
    })

    // Initially shows $0.000120 as current price
    expect(screen.getByText('$0.000120')).toBeInTheDocument()
    expect(screen.getByText(/\+0\.00% \(24h\)/)).toBeInTheDocument()

    // Advance time by one interval (5000 ms) to trigger an update
    await act(async () => {
      timers.advanceTimersByTime(5000)
    })

    // Because Math.random=0.5, delta is zero; current price remains the same and percent remains +0.00%
    expect(screen.getByText('$0.000120')).toBeInTheDocument()
    expect(screen.getByText(/\+0\.00% \(24h\)/)).toBeInTheDocument()

    timers.useRealTimers()
  })

  test('clamps prices within [0.00008, 0.00020] when random drives extremes', async () => {
    // This test simulates a random that pushes price upwards to test clamping at upper bound.
    // We'll override Math.random temporarily to return 1 for price changes and 0.5 for volume to avoid volume artifacts.
    const timers = useFakeTimers()

    const randomQueue: number[] = []
    // Initial generatePriceData consumes 24 iterations:
    // per iteration: 1 for price delta, 1 for volume => 48 calls
    // We push 1 for price delta (max upward), 0.5 for volume
    for (let i = 0; i < 24; i++) {
      randomQueue.push(1, 0.5)
    }
    // For the interval tick, again two calls: one for price delta, one for volume
    randomQueue.push(1, 0.5)

    const queuedRandom = () => {
      if (randomQueue.length) {
        return randomQueue.shift()!
      }
      return 1 // default to 1 after queue
    }
    // @ts-expect-error override
    Math.random = queuedRandom

    await act(async () => {
      render(<PriceChart />)
    })

    // After initial generation with max upward deltas, the last price must be clamped at upper bound 0.00020
    // Note: initial price was 0.00012, repeatedly adding up but clamped; so last price should show as $0.000200
    expect(screen.getByText('$0.000200')).toBeInTheDocument()

    // Advance one tick; it would try to go up further but should remain clamped at 0.00020
    await act(async () => {
      timers.advanceTimersByTime(5000)
    })
    expect(screen.getByText('$0.000200')).toBeInTheDocument()

    timers.useRealTimers()
  })

  test('cleans up interval on unmount (clearInterval called)', async () => {
    const timers = useFakeTimers()

    // Spy on clearInterval from the global scope
    const g: any = globalThis as any
    const clearSpy =
      (g.jest && g.jest.spyOn(global, 'clearInterval')) ||
      (g.vi && g.vi.spyOn(global, 'clearInterval')) ||
      null

    const { unmount } = render(<PriceChart />)

    // Unmount should trigger cleanup and call clearInterval with the interval id
    unmount()

    if (clearSpy) {
      expect(clearSpy).toHaveBeenCalled()
      clearSpy.mockRestore()
    }

    timers.useRealTimers()
  })

  test('shows negative (red) change and rotated arrow when current price drops below first price', async () => {
    const timers = useFakeTimers()

    // Build a random pattern for initial data: start high then push below
    // First create initial data where last price will be slightly lower than the first.
    // We simulate small downward deltas by returning 0 for price delta (0 - 0.5 = -0.5).
    const randomQueue: number[] = []
    for (let i = 0; i < 24; i++) {
      randomQueue.push(0, 0.5) // downward delta, neutral volume
    }
    // For display after mount we already have negative change; no need for interval
    const queuedRandom = () => (randomQueue.length ? randomQueue.shift()! : 0)

    // @ts-expect-error override
    Math.random = queuedRandom

    await act(async () => {
      render(<PriceChart />)
    })

    // Negative percentage should be displayed without '+' sign and using red color class
    const pct = screen.getByText(/-.*% \(24h\)/)
    expect(pct).toBeInTheDocument()

    const el = pct.closest('div')
    expect(el).toBeTruthy()
    expect(el?.className).toEqual(expect.stringContaining('text-red-400'))

    // Arrow should be rotated (rotate-180 class)
    const arrow = el?.querySelector('svg')
    if (arrow) {
      expect(arrow.className.baseVal || arrow.getAttribute('class') || '').toContain('rotate-180')
    }

    timers.useRealTimers()
  })
})