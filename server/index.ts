import express from "express";
import Stripe from "stripe";
import { sql, pingDb } from "./db";
import { validateEnv, printSafeConfig, config } from "./config";
import { registerRoutes } from "./routes";

async function bootstrap() {
  const app = express();

  // Middleware to preserve raw body for Stripe webhook verification
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        try {
          const url = req.originalUrl || req.url || "";
          if (url.startsWith("/api/stripe/webhook")) {
            (req as any).rawBody = buf.toString("utf8");
          }
        } catch {
          // ignore
        }
      },
    })
  );
  app.use(express.urlencoded({ extended: false }));

  // Validate env and print safe config in development
  try {
    validateEnv();
    if (app.get("env") !== "production") {
      console.log("Server configuration (safe):", printSafeConfig());
    }
  } catch (e) {
    console.error("Environment validation failed:", (e as Error).message);
    process.exit(1);
  }

  // Stripe Checkout route (server-only)
  const stripeApiKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_API_KEY || "";
  const stripe = stripeApiKey ? new Stripe(stripeApiKey, { apiVersion: "2024-06-20" as any }) : null;

  app.post("/api/stripe/checkout", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Stripe not configured" });
      }
      const { priceId, lineItems, quantity = 1, mode = "subscription", successUrl, cancelUrl } = req.body || {};

      const resolvedLineItems =
        Array.isArray(lineItems) && lineItems.length > 0
          ? lineItems
          : priceId
          ? [{ price: String(priceId), quantity: Number(quantity) || 1 }]
          : null;

      if (!resolvedLineItems) {
        return res.status(400).json({ message: "Missing lineItems or priceId" });
      }

      const proto = req.protocol;
      const host = req.get("host");
      const defaultSuccess = `${proto}://${host}/?checkout=success`;
      const defaultCancel = `${proto}://${host}/?checkout=cancel`;

      const session = await stripe.checkout.sessions.create({
        mode: mode === "payment" ? "payment" : "subscription",
        line_items: resolvedLineItems,
        success_url: successUrl || defaultSuccess,
        cancel_url: cancelUrl || defaultCancel,
        allow_promotion_codes: true,
      });

      return res.json({ id: session.id, url: session.url });
    } catch (err) {
      return res.status(500).json({ message: (err as Error).message });
    }
  });

  // Stripe Webhook route with signature verification
  app.post("/api/stripe/webhook", async (req, res) => {
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = req.headers["stripe-signature"];
    if (!stripe || !stripeWebhookSecret || !sig) {
      return res.status(400).send("Webhook misconfigured");
    }
    try {
      const rawBody = (req as any).rawBody || "";
      const event = stripe.webhooks.constructEvent(rawBody, String(sig), stripeWebhookSecret);

      // Handle events
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;
          // TODO: fulfill order, provision access, etc.
          break;
        }
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          // TODO: update subscription status in DB
          break;
        }
        default:
          // no-op
          break;
      }

      return res.json({ received: true });
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }
  });

  // Neon SQL readiness probe
  app.get("/api/ready", async (_req, res) => {
    if (!process.env.DATABASE_URL) {
      return res.json({ status: "ready", db: "not-configured" });
    }
    const result = await pingDb();
    if (result.ok) {
      return res.json({ status: "ready", db: "ok" });
    }
    return res.status(503).json({ status: "not-ready", db: "error", error: result.error });
  });

  const server = await registerRoutes(app);
  const port = config.port;
  server.listen(port, () => {
    console.log(`CHONK9K Whale Manager server listening on :${port}`);
  });
}

bootstrap().catch((e) => {
  console.error("Fatal startup error:", e);
  process.exit(1);
});
