/import express from "express";
import helmet from "helmet";
import cors, { type CorsOptions } from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { nanoid } from "nanoid";
import { config } from "./config";
import { metricsMiddleware, getMetricsText, register as metricsRegister } from "./metrics";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    genReqId: (req, res) => {
      const existing = req.headers["x-request-id"];
      if (typeof existing === "string") return existing;
      const id = nanoid();
      res.setHeader("x-request-id", id);
      return id;
    },
    autoLogging: {
      ignorePaths: ["/api/health", "/api/ready", "/api/metrics"],
    },
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie"],
      remove: true,
    },
  })
);

const allowedOrigins = config.corsAllowedOrigins;
const corsOptions: CorsOptions = allowedOrigins.length
  ? {
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }
  : { origin: true, credentials: false };

app.use(cors(corsOptions));
app.use(
  helmet({
    contentSecurityPolicy:
      app.get("env") === "production"
        ? undefined
        : false, // disable CSP in dev to ease HMR
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);
app.use(compression());

const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.use(metricsMiddleware);

app.get("/api/metrics", async (_req, res) => {
  res.setHeader("Content-Type", metricsRegister.contentType);
  res.send(await getMetricsText());
});

// ** rest of code here **
