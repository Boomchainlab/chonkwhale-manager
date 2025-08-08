export const config = {
  matcher: ['/api/:path*'],
}

// Example: add simple security headers for API responses
import type { NextRequest } from 'next/server'
export function middleware(_req: NextRequest) {
  // Let the route handlers run; headers can also be set in handlers.
  return
}
