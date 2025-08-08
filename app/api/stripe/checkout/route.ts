import { NextResponse } from "next/server"
import Stripe from "stripe"

function getStripe(): Stripe | null {
  const secret = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_API_KEY
  if (!secret) return null
  return new Stripe(secret, { apiVersion: "2024-06-20" as any })
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json(
        { message: "Stripe not configured. Set STRIPE_SECRET_KEY or STRIPE_TEST_API_KEY." },
        { status: 503 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { priceId, plan = "pro", mode = "subscription" } = body

    let lineItems
    
    if (priceId) {
      // Use provided price ID
      lineItems = [{ price: priceId, quantity: 1 }]
    } else {
      // Create dynamic pricing based on plan
      const planConfig = {
        basic: { amount: 2999, name: "CHONK9K Basic", features: "Basic whale tracking" },
        pro: { amount: 9999, name: "CHONK9K Pro", features: "Advanced whale tracking + alerts" },
        enterprise: { amount: 29999, name: "CHONK9K Enterprise", features: "Full whale analytics suite" }
      }
      
      const config = planConfig[plan as keyof typeof planConfig] || planConfig.pro
      
      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: config.name,
              description: config.features,
              images: ["https://your-domain.com/chonk-logo.png"],
            },
            recurring: mode === "subscription" ? { interval: "month" } : undefined,
            unit_amount: config.amount,
          },
          quantity: 1,
        },
      ]
    }

    const origin = new URL(request.url).origin
    const successUrl = `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/?checkout=cancel`

    const session = await stripe.checkout.sessions.create({
      mode: mode === "payment" ? "payment" : "subscription",
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer_creation: "always",
      metadata: {
        source: "chonk9k-whale-manager",
        version: "2.0.0",
        plan: plan,
      },
      subscription_data: mode === "subscription" ? {
        metadata: {
          plan: plan,
          features: "whale_tracking,alerts,analytics"
        }
      } : undefined,
    })

    return NextResponse.json({
      id: session.id,
      url: session.url,
      created: session.created,
      mode: session.mode,
      plan: plan
    })
  } catch (err: any) {
    console.error("Stripe checkout error:", err)
    return NextResponse.json(
      { message: err?.message || "Checkout failed" },
      { status: 500 }
    )
  }
}
