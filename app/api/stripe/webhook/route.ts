import Stripe from 'stripe'
import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null

function getStripe(): Stripe | null {
  const secret = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_API_KEY
  if (!secret) return null
  return new Stripe(secret, { apiVersion: "2024-06-20" as any })
}

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!stripe || !webhookSecret) {
    console.error("Stripe webhook misconfigured:", {
      hasStripe: !!stripe,
      hasWebhookSecret: !!webhookSecret,
    })
    return new NextResponse("Webhook misconfigured", { status: 400 })
  }

  const sig = request.headers.get("stripe-signature")
  if (!sig) {
    console.error("Missing stripe-signature header")
    return new NextResponse("Missing stripe-signature header", { status: 400 })
  }

  try {
    const rawBody = await request.text()
    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)

    console.log(`🔔 Stripe webhook received: ${event.type}`)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log("✅ Checkout completed:", {
          id: session.id,
          customer: session.customer,
          mode: session.mode,
          amount_total: session.amount_total,
          plan: session.metadata?.plan
        })
        
        // Create user account and grant access
        if (sql && session.customer) {
          try {
            await sql`
              INSERT INTO users (stripe_customer_id, email, plan, status, created_at)
              VALUES (
                ${session.customer as string}, 
                ${session.customer_details?.email || ''}, 
                ${session.metadata?.plan || 'pro'}, 
                'active', 
                NOW()
              )
              ON CONFLICT (stripe_customer_id) 
              DO UPDATE SET 
                plan = ${session.metadata?.plan || 'pro'},
                status = 'active',
                updated_at = NOW()
            `
          } catch (dbError) {
            console.error("Database error:", dbError)
          }
        }
        break
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("🆕 Subscription created:", {
          id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
        })
        
        if (sql) {
          try {
            await sql`
              UPDATE users 
              SET 
                subscription_id = ${subscription.id},
                status = ${subscription.status},
                updated_at = NOW()
              WHERE stripe_customer_id = ${subscription.customer as string}
            `
          } catch (dbError) {
            console.error("Database error:", dbError)
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("🔄 Subscription updated:", {
          id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
        })
        
        if (sql) {
          try {
            await sql`
              UPDATE users 
              SET 
                status = ${subscription.status},
                updated_at = NOW()
              WHERE subscription_id = ${subscription.id}
            `
          } catch (dbError) {
            console.error("Database error:", dbError)
          }
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("❌ Subscription cancelled:", {
          id: subscription.id,
          customer: subscription.customer,
        })
        
        if (sql) {
          try {
            await sql`
              UPDATE users 
              SET 
                status = 'cancelled',
                updated_at = NOW()
              WHERE subscription_id = ${subscription.id}
            `
          } catch (dbError) {
            console.error("Database error:", dbError)
          }
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        console.log("💰 Payment succeeded:", {
          id: invoice.id,
          customer: invoice.customer,
          amount_paid: invoice.amount_paid,
        })
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log("💸 Payment failed:", {
          id: invoice.id,
          customer: invoice.customer,
          amount_due: invoice.amount_due,
        })
        
        // Handle failed payment - maybe send notification
        if (sql && invoice.customer) {
          try {
            await sql`
              UPDATE users 
              SET 
                status = 'past_due',
                updated_at = NOW()
              WHERE stripe_customer_id = ${invoice.customer as string}
            `
          } catch (dbError) {
            console.error("Database error:", dbError)
          }
        }
        break
      }

      default:
        console.log(`🤷 Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ 
      received: true, 
      type: event.type,
      timestamp: new Date().toISOString()
    })
  } catch (err: any) {
    console.error("❌ Webhook error:", err)
    return new NextResponse(`Webhook Error: ${err?.message || "Unknown error"}`, {
      status: 400,
    })
  }
}
