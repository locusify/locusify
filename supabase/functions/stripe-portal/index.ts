import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getUserFromJWT } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  try {
    const { id: userId } = getUserFromJWT(req)

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Get subscription, then look up Stripe customer from providers
    const { data: subscription } = await adminClient
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (!subscription) {
      return new Response(JSON.stringify({ error: 'No subscription record' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: provider } = await adminClient
      .from('subscription_providers')
      .select('external_customer_id')
      .eq('subscription_id', subscription.id)
      .eq('provider', 'stripe')
      .maybeSingle()

    if (!provider?.external_customer_id) {
      return new Response(JSON.stringify({ error: 'No Stripe subscription found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
    const origin = req.headers.get('origin') || 'https://locusify.app'

    const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: provider.external_customer_id,
        return_url: `${origin}/map`,
      }),
    })
    const portal = await portalRes.json()

    return new Response(JSON.stringify({ url: portal.url }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
  catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
