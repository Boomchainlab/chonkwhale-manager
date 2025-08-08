import type { Request, Response, NextFunction } from "express";
import {
  Registry,
  collectDefaultMetrics,
  Histogram,
  Counter,
} from "prom-client";

export const register = new Registry();
collectDefaultMetrics({ register });

const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [register],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const method = req.method;
  // Avoid high cardinality by using path without query string
  const route = req.path || req.originalUrl || "unknown";

  const end = httpRequestDuration.startTimer({ method, route });

  res.on("finish", () => {
    const status = String(res.statusCode);
    httpRequestsTotal.labels({ method, route, status_code: status }).inc();
    end({ status_code: status });
  });

  next();
}

export async function getMetricsText(): Promise<string> {
  return register.metrics();
}
