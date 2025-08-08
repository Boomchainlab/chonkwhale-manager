import type { Request, Response, NextFunction } from "express"
import client from "prom-client"

const registry = new client.Registry()
client.collectDefaultMetrics({ register: registry })

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
})

registry.registerMetric(httpRequestDuration)

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const end = httpRequestDuration.startTimer()
  res.on("finish", () => {
    const route = (req.route && req.route.path) || req.path || "unknown_route"
    end({ method: req.method, route, status_code: String(res.statusCode) })
  })
  next()
}

export async function metricsRoute(_req: Request, res: Response) {
  res.setHeader("Content-Type", registry.contentType)
  res.end(await registry.metrics())
}
