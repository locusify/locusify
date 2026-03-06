import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!

async function verifyStripeSignature(body: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const parts = signature.split(',')
  const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1]
  const sig = parts.find(p => p.startsWith('v1='))?.split('=')[1]
  if (!timestamp || !sig)
    return false

  const payload = `${timestamp}.${body}`
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(STRIPE_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const hex = Array.from(new Uint8Array(signed)).map(b => b.toString(16).padStart(2, '0')).join('')
  // Constant-time comparison to prevent timing attacks
  const hexBytes = encoder.encode(hex)
  const sigBytes = encoder.encode(sig)
  if (hexBytes.byteLength !== sigBytes.byteLength)
    return false
  return crypto.subtle.timingSafeEqual(hexBytes, sigBytes)
}

function planFromPriceId(priceId: string): string {
  const monthlyPriceId = Deno.env.get('STRIPE_MONTHLY_PRICE_ID')
  const yearlyPriceId = Deno.env.get('STRIPE_YEARLY_PRICE_ID')
  if (priceId === monthlyPriceId)
    return 'pro_monthly'
  if (priceId === yearlyPriceId)
    return 'pro_yearly'
  return 'free'
}

// Helper: find subscription_id via Stripe customer ID in providers table
async function findSubscriptionByCustomer(supabase: ReturnType<typeof createClient>, customerId: string) {
  const { data } = await supabase
    .from('subscription_providers')
    .select('subscription_id, subscriptions(user_id)')
    .eq('provider', 'stripe')
    .eq('external_customer_id', customerId)
    .maybeSingle()
  return data
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  if (!signature || !(await verifyStripeSignature(body, signature))) {
    return new Response('Invalid signature', { status: 400 })
  }

  const event = JSON.parse(body)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.supabase_user_id
      const stripeSubscriptionId = session.subscription
      if (!userId || !stripeSubscriptionId)
        break

      // Fetch subscription details from Stripe
      const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${stripeSubscriptionId}`, {
        headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
      })
      const sub = await subRes.json()
      const priceId = sub.items?.data?.[0]?.price?.id || ''
      const plan = planFromPriceId(priceId)

      // Get internal subscription ID
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (!subscription)
        break

      // Update subscription state
      await supabase
        .from('subscriptions')
        .update({
          plan,
          status: 'active',
          provider: 'stripe',
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end || false,
        })
        .eq('id', subscription.id)

      // Upsert provider mapping with external_subscription_id
      await supabase
        .from('subscription_providers')
        .upsert({
          subscription_id: subscription.id,
          provider: 'stripe',
          external_customer_id: session.customer,
          external_subscription_id: stripeSubscriptionId,
        }, { onConflict: 'provider,external_subscription_id' })

      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object
      const match = await findSubscriptionByCustomer(supabase, sub.customer)
      if (!match)
        break

      const priceId = sub.items?.data?.[0]?.price?.id || ''
      const plan = sub.status === 'canceled' ? 'free' : planFromPriceId(priceId)

      await supabase
        .from('subscriptions')
        .update({
          plan,
          status: sub.status === 'canceled' ? 'canceled' : sub.status === 'past_due' ? 'past_due' : 'active',
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end || false,
        })
        .eq('id', match.subscription_id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const match = await findSubscriptionByCustomer(supabase, sub.customer)
      if (!match)
        break

      await supabase
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'canceled',
          cancel_at_period_end: false,
        })
        .eq('id', match.subscription_id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const match = await findSubscriptionByCustomer(supabase, invoice.customer)
      if (!match)
        break

      await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('id', match.subscription_id)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
