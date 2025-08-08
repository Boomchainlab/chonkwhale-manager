import express from "express"
import Stripe from "stripe"
import { metricsMiddleware, metricsRoute } from "./metrics"
import { config } from "./config"
import { pool } from "./db"
import WebSocket from "ws"
import { neon } from "@neondatabase/serverless"

const app = express()
const wss = new WebSocket.Server({ server: app })

// Stripe and Neon SQL clients initialization
const stripeSecret = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_API_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Neon SQL client for readiness checks
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

// Stripe webhook endpoint
app.post('/api/stripe/webhook', (req: any, res) => {
  try {
    if (!stripe || !stripeWebhookSecret) {
      return res.status(503).send('Stripe webhook not configured');
    }

    const sig = req.headers['stripe-signature'] as string | undefined;
    if (!sig) return res.status(400).send('Missing Stripe-Signature header');

    const raw = req.rawBody || JSON.stringify(req.body);
    const event = stripe.webhooks.constructEvent(raw, sig, stripeWebhookSecret);

    // Handle relevant events
    switch (event.type) {
      case 'checkout.session.completed':
        // TODO: fulfill subscription or payment
        break;
      case 'invoice.paid':
        // TODO: mark invoice paid in your system
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
      case 'customer.subscription.deleted':
        // TODO: update subscription tier/access
        break;
      default:
        // no-op
        break;
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook error:', err?.message || err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
})

// JSON parser for the rest of the routes
app.use(express.json())

// Stripe checkout endpoint
app.post('/api/stripe/checkout', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Stripe not configured' });
    }

    const {
      priceId,
      quantity = 1,
      successUrl,
      cancelUrl,
      mode = 'subscription',
      lineItems,
    } = req.body || {};

    if (!priceId && !Array.isArray(lineItems)) {
      return res.status(400).json({ message: 'Provide priceId or lineItems' });
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      success_url:
        successUrl || `${req.protocol}://${req.get('host')}/?checkout=success`,
      cancel_url:
        cancelUrl || `${req.protocol}://${req.get('host')}/?checkout=cancel`,
      line_items: lineItems ?? [{ price: priceId, quantity }],
      allow_promotion_codes: true,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
})

// Health route definitions
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Readiness endpoint
app.get('/api/ready', async (_req, res) => {
  try {
    if (!sql) {
      return res.json({
        status: 'ready',
        db: 'not-configured',
        timestamp: new Date().toISOString(),
      });
    }
    const result = await sql`select 1 as ok`;
    res.json({
      status: 'ready',
      db: 'ok',
      result: result?.[0]?.ok ?? 1,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Readiness check failed:', e);
    res.status(503).json({ status: 'not-ready' });
  }
})

// Prometheus metrics route
app.get('/api/metrics', metricsRoute)

// WebSocket heartbeat (ping/pong)
const HEARTBEAT_MS = 30000
type ExtWebSocket = WebSocket & { isAlive?: boolean }

wss.on('connection', (ws) => {
  const ews = ws as ExtWebSocket
  ews.isAlive = true
  ws.on('pong', () => { ews.isAlive = true })

  // Existing welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to CHONK9K Whale Tracker',
    timestamp: new Date().toISOString()
  }))

  ws.on('close', () => {
    console.log('WebSocket client disconnected')
  })
  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

const interval = setInterval(() => {
  wss.clients.forEach((client) => {
    const c = client as ExtWebSocket
    if (c.isAlive === false) return c.terminate()
    c.isAlive = false
    try { c.ping() } catch { try { c.terminate() } catch {} }
  })
}, HEARTBEAT_MS)

wss.on('close', () => clearInterval(interval))

// Setup authentication
async function setupAuth(app: express.Application) {
  // Authentication setup code here
}

setupAuth(app).then(() => {
  app.use(metricsMiddleware)
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`)
  })
})
