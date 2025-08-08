// Tests built for Vitest + React Testing Library (jsdom). If using Jest, replace vi.* with jest.* and adjust imports accordingly.
import React from 'react'
import { render, screen, within, act, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Prefer Vitest if available; adjust to Jest if needed.
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest'

// Mock external UI dependencies and icons to avoid style/class noise and alias resolution issues.
// If your test runner already resolves "@/..." via tsconfig paths, you can remove these mocks.
vi.mock('@/components/ui/card', () => ({
  Card: (props: any) => <div data-testid="Card" {...props} />,
  CardContent: (props: any) => <div data-testid="CardContent" {...props} />,
  CardDescription: (props: any) => <div data-testid="CardDescription" {...props} />,
  CardHeader: (props: any) => <div data-testid="CardHeader" {...props} />,
  CardTitle: (props: any) => <div data-testid="CardTitle" {...props} />,
}))
vi.mock('@/components/ui/badge', () => ({
  Badge: (props: any) => <span data-testid="Badge" {...props} />,
}))
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button data-testid="Button" {...props}>{children}</button>,
}))
vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: (props: any) => <div data-testid="ScrollArea" {...props} />,
}))
vi.mock('lucide-react', () => ({
  Activity: () => <svg data-testid="icon-activity" />,
  ExternalLink: () => <svg data-testid="icon-external-link" />,
  TrendingUp: () => <svg data-testid="icon-trending-up" />,
  TrendingDown: () => <svg data-testid="icon-trending-down" />,
  ArrowUpRight: () => <svg data-testid="icon-up" />,
  ArrowDownRight: () => <svg data-testid="icon-down" />,
}))

// Mock sonner toast
const toastSuccessSpy = vi.fn()
vi.mock('sonner', () => ({
  toast: { success: (...args: any[]) => toastSuccessSpy(...args) },
}))

// We will import the component under test after mocks
import { WhaleActivityFeed } from './whale-activity-feed'

// Utility: deterministic Date.now and Math.random to stabilize tests
const ORIGINAL_DATE_NOW = Date.now
const ORIGINAL_RANDOM = Math.random
const ORIGINAL_OPEN = window.open

// Helper to control Math.random: cycle through a fixed sequence for predictability.
// generateMockTransaction uses multiple Math.random invocations. We'll provide values to control type, amount, wallet, txHash.
// We don’t need exact values, just determinism and one "large" transaction when requested.
let randomQueue: number[] = []
function setRandomSequence(seq: number[]) {
  randomQueue = [...seq]
  Math.random = vi.fn(() => {
    if (randomQueue.length === 0) return 0.5
    return randomQueue.shift() as number
  }) as any
}

// Helper to freeze time and produce predictable timestamps
function freezeTime(ms: number) {
  vi.setSystemTime(new Date(ms))
  ;(Date as any).now = vi.fn(() => ms)
}

describe('WhaleActivityFeed', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(global, 'setInterval')
    vi.spyOn(global, 'clearInterval')
    window.open = vi.fn() as any
    toastSuccessSpy.mockReset()

    // Default deterministic environment
    freezeTime(1700000000000) // Some stable epoch
    setRandomSequence(
      // Initial 10 txs: sequence repeated; we only need determinism.
      // Each tx uses multiple Math.random; we'll provide more than needed.
      new Array(100).fill(0.4)
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    ;(Date as any).now = ORIGINAL_DATE_NOW
    Math.random = ORIGINAL_RANDOM
    window.open = ORIGINAL_OPEN
  })

  it('renders header, live badge, and pause button; shows 10 initial transactions', async () => {
    render(<WhaleActivityFeed />)

    // Header
    expect(screen.getByText('Live Whale Activity')).toBeInTheDocument()
    expect(screen.getByText('Real-time large CHONK9K transactions (100K+ tokens)')).toBeInTheDocument()

    // Badge shows Live
    expect(screen.getByText('Live')).toBeInTheDocument()

    // Toggle button shows Pause
    const toggleBtn = screen.getByRole('button', { name: /Pause/i })
    expect(toggleBtn).toBeInTheDocument()

    // Scroll area and content
    const scrollArea = screen.getByTestId('ScrollArea')
    expect(scrollArea).toBeInTheDocument()

    // There should be 10 transaction rows rendered
    // Rows are items with "CHONK9K" amount label and external link button
    const amountNodes = await screen.findAllByText(/CHONK9K$/i)
    expect(amountNodes.length).toBe(10)

    // Each row has an external link button (icon-only)
    const externalButtons = screen.getAllByRole('button')
      .filter(btn => within(btn).queryByTestId('icon-external-link'))
    expect(externalButtons.length).toBeGreaterThanOrEqual(10)

    // Amount/value formatting checks (uses K formatting for amounts >= 1,000, and $x.xx for value)
    // With amount between 100,000 and 1,100,000, expect K or M; since our default randoms are 0.4, amounts vary but always >=100,000 per code.
    // We assert at least one K/M instance and value with 2 decimals.
    const someK = screen.queryAllByText(/K CHONK9K$/).length
    const someM = screen.queryAllByText(/M CHONK9K$/).length
    expect(someK + someM).toBeGreaterThan(0)

    const values = screen.getAllByText(/^\$\d+\.\d{2}$/)
    expect(values.length).toBeGreaterThan(0)

    // Time is shown in HH:MM:SS with 24h formatting
    const timeLike = screen.getAllByText(/^\d{2}:\d{2}:\d{2}$/)
    expect(timeLike.length).toBeGreaterThan(0)
  })

  it('toggles live/pause state, updating badge and button labels', () => {
    render(<WhaleActivityFeed />)

    // Initially Live and "Pause"
    expect(screen.getByText('Live')).toBeInTheDocument()
    const toggleBtn = screen.getByRole('button', { name: /Pause/i })
    expect(toggleBtn).toBeInTheDocument()

    // Click to pause
    fireEvent.click(toggleBtn)
    expect(screen.getByText('Paused')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Resume/i })).toBeInTheDocument()

    // Click to resume
    fireEvent.click(screen.getByRole('button', { name: /Resume/i }))
    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument()
  })

  it('adds a new transaction every 3s when live and caps list at 50; does not add when paused', async () => {
    render(<WhaleActivityFeed />)

    // Initial 10
    let amountNodes = screen.getAllByText(/CHONK9K$/)
    expect(amountNodes.length).toBe(10)

    // Advance 3s -> +1
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    amountNodes = screen.getAllByText(/CHONK9K$/)
    expect(amountNodes.length).toBe(11)

    // Pause
    fireEvent.click(screen.getByRole('button', { name: /Pause/i }))

    // Advance 3s while paused: no increase
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    amountNodes = screen.getAllByText(/CHONK9K$/)
    expect(amountNodes.length).toBe(11)

    // Resume and add many to hit the cap
    fireEvent.click(screen.getByRole('button', { name: /Resume/i }))
    await act(async () => {
      vi.advanceTimersByTime(3000 * 45) // 45 more -> total 56 but should cap at 50
    })
    amountNodes = screen.getAllByText(/CHONK9K$/)
    expect(amountNodes.length).toBe(50)
  })

  it('triggers a toast for large transactions (> 500,000)', async () => {
    render(<WhaleActivityFeed />)

    // Configure a sequence that yields a large amount on the next interval tick.
    // In generateMockTransaction:
    //   amount = floor(random()*1000000) + 100000
    // We want amount > 500,000. Choose random = 0.5 -> amount = 600,000.
    setRandomSequence([
      // for the next newTransaction generation:
      0.5, // type picker
      0.5, // amount to be > 500k
      0.2, // wallet part a
      0.2, // wallet part b
      0.3, // txHash
    ])

    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    expect(toastSuccessSpy).toHaveBeenCalledTimes(1)
    const msg = String(toastSuccessSpy.mock.calls[0]?.[0] ?? '')
    expect(msg).toMatch(/Large (buy|sell) detected/i)
  })

  it('opens solscan link for a transaction when external link button is clicked', () => {
    render(<WhaleActivityFeed />)

    // Click the first external link button found
    const externalButtons = screen.getAllByRole('button').filter(btn =>
      within(btn).queryByTestId('icon-external-link')
    )
    expect(externalButtons.length).toBeGreaterThan(0)

    fireEvent.click(externalButtons[0])

    // We can't easily predict the txHash because of randomness.
    // We assert that window.open is called with a solscan tx URL and target _blank.
    expect(window.open).toHaveBeenCalled()
    const [url, target] = (window.open as any).mock.calls[0]
    expect(String(url)).toMatch(/^https:\/\/solscan\.io\/tx\/[a-z0-9]+/i)
    expect(target).toBe('_blank')
  })
})