"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

/**
 * Provides theme context to its child components using the NextThemesProvider.
 *
 * Wraps children with theme management capabilities, allowing dynamic theme switching and persistence.
 *
 * @param children - The components that will have access to the theme context
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
