import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)
        
        // Here you would typically:
        // 1. Update user subscription in database
        // 2. Send confirmation email
        // 3. Grant access to premium features
        
        break

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription created:', subscription.id)
        
        // Handle new subscription
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', updatedSubscription.id)
        
        // Handle subscription changes
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        console.log('Subscription cancelled:', deletedSubscription.id)
        
        // Handle subscription cancellation
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment succeeded:', invoice.id)
        
        // Handle successful payment
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        console.log('Payment failed:', failedInvoice.id)
        
        // Handle failed payment
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ 
      success: true, 
      received: true 
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
