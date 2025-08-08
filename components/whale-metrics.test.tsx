/**
 * Tests for WhaleMetrics component.
 *
 * Testing stack used:
 * - Framework: Jest or Vitest (auto-detected at runtime)
 * - Library: @testing-library/react
 *
 * These tests:
 * - Render and verify all metric labels.
 * - Control Math.random to test trend color classes (up/down).
 * - Validate value formatting (currency with commas, and "K CHONK9K" suffix).
 * - Ensure periodic updates occur every 5 seconds and cleanup clears intervals on unmount.
 *
 * Implementation notes:
 * - We use a virtual mock for "@/components/ui/card" so alias resolution isn't required in the runner.
 * - We avoid jest-dom-only matchers to reduce setup needs (no toBeInTheDocument).
 */
import * as React from 'react'
import { render, screen, act, cleanup } from '@testing-library/react'

// Detect runner and timer controller (Jest or Vitest)
const g: any = globalThis as any
const isJest = !!g.jest
const isVi = !!g.vi
const timer = isVi ? g.vi : g.jest

// Mock UI Card components as inert containers via virtual mock (works without alias config).
const mocker: any = g.vi ?? g.jest
if (!mocker || typeof mocker.mock !== 'function') {
  throw new Error('A test runner with mocking capability (jest or vitest) is required.')
}
mocker.mock('@/components/ui/card', () => {
  const Card = ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>
  const CardHeader = ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>
  const CardContent = ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>
  const CardTitle = ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>
  const CardDescription = ({ children, ...props }: any) => <div data-testid="card-description" {...props}>{children}</div>
  return { Card, CardHeader, CardContent, CardTitle, CardDescription }
}, { virtual: true })

// Import the component after applying the mock above.
// Use require if available, else dynamic import to support ESM-based runners.
let WhaleMetrics: any
beforeAll(async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    WhaleMetrics = require('./whale-metrics').WhaleMetrics
  } catch {
    const mod: any = await import('./whale-metrics')
    WhaleMetrics = mod.WhaleMetrics
  }
})

// Deterministic Math.random utility
function withMockedRandom(values: number[], fn: () => void) {
  const originalRandom = Math.random
  let i = 0
  ;(Math as any).random = () => {
    const v = values[i] ?? values[values.length - 1] ?? 0.5
    i++
    return v
  }
  try {
    fn()
  } finally {
    ;(Math as any).random = originalRandom
  }
}

beforeEach(() => {
  g.jest?.useFakeTimers()
  g.vi?.useFakeTimers()
})

afterEach(() => {
  cleanup()
  g.jest?.useRealTimers()
  g.jest?.clearAllTimers?.()
  g.jest?.resetModules?.()
  g.vi?.useRealTimers()
  g.vi?.clearAllTimers?.()
  g.vi?.resetModules?.()
})

// The component generates 4 metrics; each metric uses Math.random 3 times (value, change, trend):
// total 12 calls per update.
// We'll craft sequences to control trend and value formatting.

test('renders all metric labels on initial mount', () => {
  withMockedRandom(new Array(12).fill(0.42), () => {
    render(<WhaleMetrics />)
  })

  // Assert labels exist (no jest-dom dependency)
  expect(screen.queryByText('Total Whale Volume (24h)')).not.toBeNull()
  expect(screen.queryByText('Active Whales')).not.toBeNull()
  expect(screen.queryByText('Whale Transactions')).not.toBeNull()
  expect(screen.queryByText('Average Transaction')).not.toBeNull()

  // There should be 4 cards
  const cards = screen.getAllByTestId('card')
  expect(cards.length).toBe(4)
})

test('applies green class for up-trend and red for down-trend', () => {
  // Sequence to force trends: up, down, up, down
  // For each metric: [value, change, trend]
  const seq: number[] = [
    0.10, 0.20, 0.9,  // up
    0.15, 0.25, 0.1,  // down
    0.30, 0.40, 0.9,  // up
    0.35, 0.45, 0.1   // down
  ]

  withMockedRandom(seq, () => {
    render(<WhaleMetrics />)
  })

  const changeSpans = screen.getAllByText(/from last hour$/)
  // Expect 2 green and 2 red
  const greens = changeSpans.filter(el => (el as HTMLElement).className.includes('text-green-400'))
  const reds = changeSpans.filter(el => (el as HTMLElement).className.includes('text-red-400'))
  expect(greens.length).toBe(2)
  expect(reds.length).toBe(2)
})

test('formats values: currency contains $ and comma; average has K CHONK9K suffix', () => {
  const seq = [
    0.234, 0.1, 0.9, // Metric 1
    0.1,   0.1, 0.9, // Metric 2
    0.2,   0.1, 0.9, // Metric 3
    0.321, 0.1, 0.9  // Metric 4
  ]

  withMockedRandom(seq, () => {
    render(<WhaleMetrics />)
  })

  // Volume card formatting
  const volLabel = screen.getByText('Total Whale Volume (24h)')
  const volCard = volLabel.closest('[data-testid="card"]') as HTMLElement
  const volValue = volCard.querySelector('.text-2xl') as HTMLElement
  expect(volValue).not.toBeNull()
  expect(volValue.textContent?.startsWith('$')).toBe(true)
  expect(/,\d{3}/.test(volValue.textContent || '')).toBe(true) // includes grouping comma

  // Average transaction suffix
  const avgLabel = screen.getByText('Average Transaction')
  const avgCard = avgLabel.closest('[data-testid="card"]') as HTMLElement
  const avgValue = avgCard.querySelector('.text-2xl') as HTMLElement
  expect(avgValue).not.toBeNull()
  expect((avgValue.textContent || '').endsWith('K CHONK9K')).toBe(true)
})

test('updates every 5 seconds and cleans up interval on unmount', () => {
  const seqFirstUpdate = new Array(12).fill(0.4) // initial
  const seqSecondUpdate = new Array(12).fill(0.6) // after 5s

  const originalRandom = Math.random
  let seq = [...seqFirstUpdate, ...seqSecondUpdate]
  let idx = 0
  ;(Math as any).random = () => {
    const v = seq[idx] ?? 0.5
    idx++
    return v
  }

  try {
    const { unmount } = render(<WhaleMetrics />)
    expect(screen.getAllByTestId('card').length).toBe(4)

    // Capture initial volume value
    const volLabel = screen.getByText('Total Whale Volume (24h)')
    const volCard = volLabel.closest('[data-testid="card"]') as HTMLElement
    const volValueBefore = (volCard.querySelector('.text-2xl') as HTMLElement).textContent || ''

    // Advance timers by 5s to trigger next update
    act(() => {
      timer.advanceTimersByTime(5000)
    })

    // Verify content updated (value likely changed due to different randoms)
    const volValueAfter = (volCard.querySelector('.text-2xl') as HTMLElement).textContent || ''
    expect(volValueAfter).not.toBe(volValueBefore)

    // Unmount and assert timers cleared if API available
    unmount()
    const timerCount =
      (isJest ? g.jest.getTimerCount?.() : g.vi?.getTimerCount?.()) as number | undefined
    if (typeof timerCount === 'number') {
      expect(timerCount).toBe(0)
    }
  } finally {
    ;(Math as any).random = originalRandom
  }
})