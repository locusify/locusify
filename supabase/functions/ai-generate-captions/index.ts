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

    // Check Pro subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!subscription?.plan?.startsWith('pro') || subscription.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Pro subscription required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { waypoints } = await req.json()

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
    const waypointDescriptions = waypoints.map((wp: { lat: number, lng: number, timestamp: string }, i: number) => {
      return `Point ${i + 1}: (${wp.lat.toFixed(4)}, ${wp.lng.toFixed(4)}) at ${wp.timestamp}`
    }).join('\n')

    const prompt = `Generate short, evocative captions for each waypoint of a travel journey. Each caption should be 5-15 words, poetic or descriptive, capturing the feel of the location and time.

Waypoints:
${waypointDescriptions}

Respond in JSON format:
{
  "captions": ["caption for point 1", "caption for point 2", ...]
}`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 500,
      }),
    })
    if (!openaiRes.ok) {
      const errBody = await openaiRes.text()
      return new Response(JSON.stringify({ error: `OpenAI error: ${openaiRes.status}`, detail: errBody }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const openaiData = await openaiRes.json()
    if (!openaiData.choices?.[0]?.message?.content) {
      return new Response(JSON.stringify({ error: 'Invalid OpenAI response' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const result = JSON.parse(openaiData.choices[0].message.content)

    // Track usage
    await supabase
      .from('usage_tracking')
      .insert({ user_id: user.id, feature: 'ai_captions' })

    return new Response(JSON.stringify(result), {
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
