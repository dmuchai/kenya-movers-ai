// Supabase Edge Function: ai-estimator
// Purpose: Use OpenAI (or compatible) Chat Completions API to:
// 1. Produce clarifying questions (if data is incomplete)
// 2. Produce a cost estimate with structured breakdown
// POST JSON body: { quote: {...}, distance_meters?: number }
// Returns JSON: { estimation: { total, breakdown[], clarifyingQuestions[] }}
// Environment variables needed:
//   OPENAI_API_KEY  (store via `supabase secrets set OPENAI_API_KEY=...`)
// Optional:
//   OPENAI_BASE_URL (for Azure/OpenAI compatible endpoints)
//   OPENAI_MODEL (default gpt-4o-mini or gpt-4o)
//   COST_BASE, COST_DISTANCE_FACTOR_KM, COST_LABOR_MULTIPLIER, ... (to tune heuristics)
//
// Security: This function runs server-side. Never expose OPENAI_API_KEY to the client.
// Rate limiting can be added via RLS + a usage table (not implemented here).

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck

interface EstimatorRequest {
  quote: any
  distance_meters?: number
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

const headersBase = { ...corsHeaders, 'Content-Type': 'application/json' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: headersBase })

  try {
    const body = await req.json() as EstimatorRequest
    if (!body.quote) return new Response(JSON.stringify({ error: 'Missing quote object' }), { status: 400, headers: headersBase })

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }), { status: 500, headers: headersBase })

    const OPENAI_BASE_URL = Deno.env.get('OPENAI_BASE_URL') || 'https://api.openai.com/v1'
    const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini'

    // Build a system prompt instructing the model to output JSON only
    const systemPrompt = `You are a structured estimator for a household moving service in Kenya.
Return ONLY valid minified JSON with keys: total (number), breakdown (array of {label,amount,rationale}), clarifyingQuestions (array of {id,field,question}).
Amounts in Kenyan Shillings. Consider distance, property size, floors, elevators, inventory, and additional services. If data missing, include clarifying questions.
Ensure sum of breakdown amounts equals total.`

    const userContent = {
      quote: body.quote,
      distance_meters: body.distance_meters,
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(userContent) }
    ]

    const resp = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    })

    const data = await resp.json()
    if (!resp.ok) {
      console.error('OpenAI error', data)
      return new Response(JSON.stringify({ error: 'OpenAI API error', details: data }), { status: 502, headers: headersBase })
    }

    const content = data.choices?.[0]?.message?.content
    let estimation
    try {
      estimation = JSON.parse(content)
    } catch (_e) {
      return new Response(JSON.stringify({ error: 'Model output parse error', raw: content }), { status: 500, headers: headersBase })
    }

    return new Response(JSON.stringify({ estimation }), { status: 200, headers: headersBase })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: 'Unexpected error', details: String(e) }), { status: 500, headers: headersBase })
  }
})
