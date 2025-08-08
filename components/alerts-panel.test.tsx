/**
 * Tests for AlertsPanel
 *
 * Testing library and framework:
 * - Vitest (describe/it/expect/vi)
 * - @testing-library/react for rendering and queries
 * - @testing-library/user-event for interactions
 *
 * Notes:
 * - The repository does not currently declare a test runner. These tests are authored for Vitest given Vite is present.
 * - We stub shadcn-ui/Radix wrappers and lucide-react icons to avoid DOM/portal complexity.
 * - We mock 'sonner' toast to assert success/error notifications.
 * - We avoid jest-dom matchers to minimize dependency assumptions.
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock sonner's toast API to verify success/error notifications
vi.mock('sonner', () => {
  return {
    toast: {
      success: vi.fn(),
      error: vi.fn()
    }
  }
})

// Mock shadcn-ui wrappers with simple DOM elements
vi.mock('@/components/ui/card', () => {
  const Stub: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => <div {...props}>{children}</div>
  return {
    Card: Stub,
    CardContent: Stub,
    CardDescription: Stub,
    CardHeader: Stub,
    CardTitle: Stub
  }
})
vi.mock('@/components/ui/button', () => {
  const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => <button {...props}>{children}</button>
  return { Button }
})
vi.mock('@/components/ui/input', () => {
  const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} />
  return { Input }
})
// Simplified Select mock; we don't rely on changing the Select in tests, only value input and name.
vi.mock('@/components/ui/select', () => {
  const Select: React.FC<{ value: string; onValueChange: (v: string) => void; children?: React.ReactNode }> = ({ children }) => <div>{children}</div>
  const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => <div role="button" aria-label="select-trigger" {...props}>{children}</div>
  const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => <div role="listbox" {...props}>{children}</div>
  const SelectItem: React.FC<{ value: string; children?: React.ReactNode }> = ({ value, children }) => <div role="option" data-value={value}>{children}</div>
  const SelectValue: React.FC = () => <span />
  return { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }
})
vi.mock('@/components/ui/label', () => {
  const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, ...props }) => <label {...props}>{children}</label>
  return { Label }
})
vi.mock('@/components/ui/switch', () => {
  const Switch: React.FC<{ checked?: boolean; onCheckedChange?: (checked: boolean) => void }> = ({ checked, onCheckedChange }) => (
    <input
      type="checkbox"
      role="switch"
      aria-checked={!!checked}
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.currentTarget.checked)}
    />
  )
  return { Switch }
})
vi.mock('@/components/ui/badge', () => {
  const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ children, ...props }) => <span {...props}>{children}</span>
  return { Badge }
})

// Provide distinct test IDs for icons to target delete buttons precisely
vi.mock('lucide-react', () => {
  const Icon: React.FC<React.SVGProps<SVGSVGElement> & { 'data-testid'?: string }> = (props) => <svg {...props} />
  const Bell: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon data-testid="bell-icon" {...props} />
  const Plus: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon data-testid="plus-icon" {...props} />
  const Trash2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon data-testid="trash-icon" {...props} />
  const Settings: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon data-testid="settings-icon" {...props} />
  return { Bell, Plus, Trash2, Settings }
})

// Import component under test using a relative path to avoid alias resolution for the component itself.
// Internally, the component uses alias for shadcn-ui which are mocked above.
import { AlertsPanel } from './alerts-panel'
import { toast } from 'sonner'

describe('AlertsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders initial active alerts count and items', () => {
    render(<AlertsPanel />)
    // Two alerts enabled by default
    expect(screen.getByText(/Active Alerts \(2\)/i)).toBeTruthy()

    // Verify the two predefined alerts render with names and badges
    expect(screen.getByText('Large Buy Alert')).toBeTruthy()
    expect(screen.getByText('Whale Activity Spike')).toBeTruthy()
    // Icons present
    expect(screen.getAllByTestId('bell-icon').length + screen.getAllByTestId('plus-icon').length).toBeGreaterThan(0)
  })

  it('displays correct labels for alert type and value', () => {
    render(<AlertsPanel />)
    // Volume 500000 -> formatted with comma and unit
    expect(screen.getByText(/Volume/i)).toBeTruthy()
    expect(screen.getByText(/Trigger when above 500,000 CHONK9K/i)).toBeTruthy()

    // Whale Activity -> transactions/hour
    expect(screen.getByText(/Whale Activity/i)).toBeTruthy()
    expect(screen.getByText(/Trigger when above 10 transactions\/hour/i)).toBeTruthy()
  })

  it('prevents creating an alert when name or value missing and shows error toast', async () => {
    const user = userEvent.setup()
    render(<AlertsPanel />)

    await user.click(screen.getByRole('button', { name: /Create Alert/i }))
    expect(toast.error).toHaveBeenCalledWith('Please fill in all fields')
  })

  it('creates a new alert with valid inputs and shows success toast', async () => {
    const user = userEvent.setup()
    render(<AlertsPanel />)

    const nameInput = screen.getByLabelText(/Alert Name/i)
    const valueInput = screen.getByLabelText(/Threshold Value/i)

    await user.clear(nameInput)
    await user.type(nameInput, 'Price Dip')

    await user.clear(valueInput)
    await user.type(valueInput, '123')

    await user.click(screen.getByRole('button', { name: /Create Alert/i }))

    expect(toast.success).toHaveBeenCalledWith('Alert created successfully')
    expect(screen.getByText(/Active Alerts \(3\)/i)).toBeTruthy()
    expect(screen.getByText('Price Dip')).toBeTruthy()
  })

  it('toggles an alert enabled state via switch and updates active count', async () => {
    const user = userEvent.setup()
    render(<AlertsPanel />)

    expect(screen.getByText(/Active Alerts \(2\)/i)).toBeTruthy()

    const switches = screen.getAllByRole('switch')
    expect(switches.length).toBeGreaterThanOrEqual(1)
    await user.click(switches[0])

    expect(screen.getByText(/Active Alerts \(1\)/i)).toBeTruthy()
  })

  it('deletes a specific alert via trash icon and shows success toast', async () => {
    const user = userEvent.setup()
    render(<AlertsPanel />)

    // Two rows => two trash icons. Delete the second row ("Whale Activity Spike")
    let trashIcons = screen.getAllByTestId('trash-icon')
    expect(trashIcons.length).toBeGreaterThanOrEqual(2)
    await user.click(trashIcons[1])

    expect(toast.success).toHaveBeenCalledWith('Alert deleted')
    expect(screen.getByText(/Active Alerts \(1\)/i)).toBeTruthy()
    expect(screen.queryByText('Whale Activity Spike')).toBeNull()
    // Ensure the other alert still exists
    expect(screen.getByText('Large Buy Alert')).toBeTruthy()
  })

  it('renders empty state when all alerts are deleted', async () => {
    const user = userEvent.setup()
    render(<AlertsPanel />)

    // Delete both alerts
    let trashIcons = screen.getAllByTestId('trash-icon')
    expect(trashIcons.length).toBe(2)
    await user.click(trashIcons[0])

    // Re-query after state update for the second delete
    trashIcons = screen.getAllByTestId('trash-icon')
    await user.click(trashIcons[0])

    expect(screen.getByText(/No alerts configured/i)).toBeTruthy()
    expect(screen.getByText(/Create your first alert to get started/i)).toBeTruthy()
    expect(screen.getByText(/Active Alerts \(0\)/i)).toBeTruthy()
  })

  it('handles edge case: zero threshold is treated as missing and blocked', async () => {
    const user = userEvent.setup()
    render(<AlertsPanel />)

    const nameInput = screen.getByLabelText(/Alert Name/i)
    const valueInput = screen.getByLabelText(/Threshold Value/i)

    await user.clear(nameInput)
    await user.type(nameInput, 'Edge Case')

    await user.clear(valueInput)
    await user.type(valueInput, '0')

    await user.click(screen.getByRole('button', { name: /Create Alert/i }))
    expect(toast.error).toHaveBeenCalledWith('Please fill in all fields')
  })
})