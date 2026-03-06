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
      .single()

    if (!subscription?.plan?.startsWith('pro') || subscription.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Pro subscription required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { waypoints, totalDistance, totalDuration, photoCount } = await req.json()

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
    const prompt = `You are a travel video template recommender. Given trip metadata, recommend the best replay template and any custom adjustments.

Available templates:
- "vlog": Energetic cuts, warm filter, upbeat music. Best for city trips, short fun outings.
- "minimal": Clean, no music, no filter. Best for simple routes.
- "cinematic": Slow crossfades, cinematic filter, orchestral music. Best for scenic/epic trips.
- "travel-diary": Vintage slides, acoustic guitar, typewriter text. Best for multi-day journeys.
- "night-mode": Cool tones, ambient music, neon text. Best for nighttime/urban adventures.

Trip metadata:
- Waypoints: ${waypoints.length} GPS points
- Total distance: ${totalDistance.toFixed(1)} km
- Total duration: ${totalDuration.toFixed(1)} hours
- Photo count: ${photoCount}

Respond in JSON format:
{
  "templateId": "string",
  "adjustments": {
    "segmentDuration": number_or_null,
    "filterIntensity": number_or_null
  },
  "reasoning": "short explanation"
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
        max_tokens: 300,
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
    const recommendation = JSON.parse(openaiData.choices[0].message.content)

    // Track usage
    await supabase
      .from('usage_tracking')
      .insert({ user_id: user.id, feature: 'ai_recommend' })

    return new Response(JSON.stringify(recommendation), {
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
