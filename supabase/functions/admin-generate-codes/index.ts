import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function generateCode(prefix: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion
  let segment1 = ''
  let segment2 = ''
  for (let i = 0; i < 4; i++) {
    segment1 += chars[Math.floor(Math.random() * chars.length)]
    segment2 += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${prefix}-${segment1}-${segment2}`
}

Deno.serve(async (req) => {
  try {
    // Verify admin secret
    const adminSecret = Deno.env.get('ADMIN_SECRET')
    const providedSecret = req.headers.get('x-admin-secret')
    if (!adminSecret || providedSecret !== adminSecret) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const {
      count = 1,
      plan = 'pro_yearly',
      duration_days = 365,
      max_uses = 1,
      prefix = 'LCSY',
      expires_at = null,
    } = await req.json()

    if (count < 1 || count > 100) {
      return new Response(JSON.stringify({ error: 'count must be 1-100' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!['pro_monthly', 'pro_yearly'].includes(plan)) {
      return new Response(JSON.stringify({ error: 'plan must be pro_monthly or pro_yearly' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (typeof duration_days !== 'number' || duration_days < 1 || duration_days > 3650) {
      return new Response(JSON.stringify({ error: 'duration_days must be 1-3650' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (typeof max_uses !== 'number' || max_uses < 1 || max_uses > 10000) {
      return new Response(JSON.stringify({ error: 'max_uses must be 1-10000' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      codes.push(generateCode(prefix))
    }

    const rows = codes.map(code => ({
      code,
      plan,
      duration_days,
      max_uses,
      expires_at,
    }))

    const { data, error } = await adminClient
      .from('redemption_codes')
      .insert(rows)
      .select('code, plan, duration_days, max_uses, expires_at')

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ codes: data }), {
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
