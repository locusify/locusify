import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { priceId } = await req.json()
    const allowedPriceIds = [
      Deno.env.get('STRIPE_MONTHLY_PRICE_ID'),
      Deno.env.get('STRIPE_YEARLY_PRICE_ID'),
    ].filter(Boolean)
    if (!priceId || !allowedPriceIds.includes(priceId)) {
      return new Response(JSON.stringify({ error: 'Invalid priceId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Get subscription ID
    const { data: subscription } = await adminClient
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return new Response(JSON.stringify({ error: 'No subscription record' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Look up existing Stripe customer from providers table
    const { data: provider } = await adminClient
      .from('subscription_providers')
      .select('external_customer_id')
      .eq('subscription_id', subscription.id)
      .eq('provider', 'stripe')
      .single()

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
    let customerId = provider?.external_customer_id

    if (!customerId) {
      // Create Stripe customer
      const customerRes = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'email': user.email || '',
          'metadata[supabase_user_id]': user.id,
        }),
      })
      const customer = await customerRes.json()
      customerId = customer.id

      // Save to providers table
      await adminClient
        .from('subscription_providers')
        .upsert({
          subscription_id: subscription.id,
          provider: 'stripe',
          external_customer_id: customerId,
        }, { onConflict: 'provider,external_subscription_id' })
    }

    // Create Checkout Session
    const origin = req.headers.get('origin') || 'https://locusify.app'
    const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'customer': customerId,
        'mode': 'subscription',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'success_url': `${origin}/map?checkout=success`,
        'cancel_url': `${origin}/map?checkout=cancel`,
        'metadata[supabase_user_id]': user.id,
      }),
    })
    const session = await sessionRes.json()

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
