'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type EnvInfo = {
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string
  NEXT_PUBLIC_EMAIL_ADDRESS?: string
  NEXT_PUBLIC_MINT_TOKEN_ADDRESS?: string
}

export default function ProjectViewer() {
  const [env, setEnv] = useState<EnvInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/env', { cache: 'no-store' })
        const data = await res.json()
        setEnv(data)
      } catch {
        setEnv(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  function mask(value?: string) {
    if (!value) return ''
    if (value.length <= 8) return '••••'
    return `${value.slice(0, 4)}••••${value.slice(-4)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Viewer</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="grid gap-1">
              <p><span className="font-medium">Public Env:</span></p>
              <ul className="list-disc pl-5">
                <li>Publishable key: {mask(env?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)}</li>
                <li>Email address: {env?.NEXT_PUBLIC_EMAIL_ADDRESS || '(not set)'}</li>
                <li>Mint token: {env?.NEXT_PUBLIC_MINT_TOKEN_ADDRESS || '(not set)'}</li>
              </ul>
            </div>
            <div className="grid gap-1">
              <p className="font-medium">API Links</p>
              <ul className="list-disc pl-5">
                <li><a className="text-blue-600 underline" href="/api/ping">/api/ping</a></li>
                <li><a className="text-blue-600 underline" href="/api/ready">/api/ready</a></li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
