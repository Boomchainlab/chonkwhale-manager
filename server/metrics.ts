import type { Request, Response, NextFunction } from "express"
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from "prom-client"
import { config } from "./config"

export const registry = new Registry()

// Default Node/Process metrics
collectDefaultMetrics({ register: registry })

// HTTP metrics
const httpRequestCounter = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [registry],
})

const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
})

export function metricsMiddleware() {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!config.enableMetrics) return next()

    const start = process.hrtime.bigint()
    const method = req.method
    // capture route after response (when available)
    res.on("finish", () => {
      const status = res.statusCode
      // route might be undefined (e.g., 404 or middleware-only)
      const route =
        (req as any).route?.path ||
        (req as any).originalUrl ||
        (req as any).url ||
        "unknown"

      const end = process.hrtime.bigint()
      const durationSeconds = Number(end - start) / 1_000_000_000

      httpRequestCounter
        .labels(method, String(route), String(status))
        .inc(1)

      httpRequestDuration
        .labels(method, String(route), String(status))
        .observe(durationSeconds)
    })

    next()
  }
}

export async function metricsHandler(
  _req: Request,
  res: Response
): Promise<void> {
  if (!config.enableMetrics) {
    res.status(404).json({ error: "metrics disabled" })
    return
  }
  res.set("Content-Type", registry.contentType)
  res.end(await registry.metrics())
}
