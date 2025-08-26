// Supabase Edge Function: ai-estimator
// AI-powered cost estimation using OpenAI

export interface EstimatorRequest {
  quote: any
  distance_meters?: number
}

export interface EstimationBreakdownItem {
  label: string
  amount: number
  rationale: string
}

export interface ClarifyingQuestion {
  id: string
  field: string
  question: string
}

export interface AIEstimation {
  total: number
  breakdown: EstimationBreakdownItem[]
  clarifyingQuestions: ClarifyingQuestion[]
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
    
    // If no OpenAI key, fall back to heuristic estimation
    if (!OPENAI_API_KEY) {
      const estimation = generateHeuristicEstimation(body.quote, body.distance_meters)
      return new Response(JSON.stringify({ estimation }), { status: 200, headers: headersBase })
    }

    const OPENAI_BASE_URL = Deno.env.get('OPENAI_BASE_URL') || 'https://api.openai.com/v1'
    const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini'

    // Build system prompt for structured output
    const systemPrompt = `You are a cost estimator for household moving services in Kenya.
Return ONLY valid JSON with keys: total (number), breakdown (array of {label,amount,rationale}), clarifyingQuestions (array of {id,field,question}).
Amounts in Kenyan Shillings. Consider distance, property size, floors, elevators, inventory, and additional services.
Base rates: KES 15,000-25,000 for local moves, +KES 50-100 per km for distance, +20-50% for stairs/no elevator.
Ensure breakdown amounts sum to total.`

    const userContent = {
      quote: body.quote,
      distance_meters: body.distance_meters,
      context: 'Kenya moving service cost estimation'
    }

    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(userContent) }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const aiResponse = await response.json()
    const content = aiResponse.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    try {
      const estimation = JSON.parse(content) as AIEstimation
      return new Response(JSON.stringify({ estimation }), { status: 200, headers: headersBase })
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      // Fall back to heuristic if AI response is malformed
      const estimation = generateHeuristicEstimation(body.quote, body.distance_meters)
      return new Response(JSON.stringify({ estimation }), { status: 200, headers: headersBase })
    }

  } catch (error) {
    console.error('AI Estimator Error:', error)
    // Always fall back to heuristic estimation on error
    try {
      const body = await req.json() as EstimatorRequest
      const estimation = generateHeuristicEstimation(body.quote, body.distance_meters)
      return new Response(JSON.stringify({ estimation }), { status: 200, headers: headersBase })
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to generate estimation' }), { status: 500, headers: headersBase })
    }
  }
})

// Fallback heuristic estimation
function generateHeuristicEstimation(quote: any, distanceMeters?: number): AIEstimation {
  const base = 15000 // Base cost in KES
  const distanceKm = distanceMeters ? distanceMeters / 1000 : 10
  const distanceFactor = Math.max(0, distanceKm - 5) * 75 // KES 75 per km after 5km
  
  // Property size multiplier
  const sizeMultiplier = {
    'studio': 0.8,
    '1-bedroom': 1.0,
    '2-bedroom': 1.3,
    '3-bedroom': 1.6,
    '4-bedroom': 2.0,
    'house': 2.5,
    'office': 1.8
  }[quote.property_size] || 1.0

  const baseCost = base * sizeMultiplier
  const laborFactor = quote.inventory ? Object.keys(quote.inventory).length * 500 : 2000
  const servicesFactor = (quote.additional_services?.length || 0) * 2500

  const total = Math.round(baseCost + distanceFactor + laborFactor + servicesFactor)

  const breakdown: EstimationBreakdownItem[] = [
    { label: 'Base Service', amount: Math.round(baseCost), rationale: `${quote.property_size} property moving` },
    { label: 'Distance', amount: Math.round(distanceFactor), rationale: `${distanceKm.toFixed(1)}km transportation` },
    { label: 'Labor & Handling', amount: Math.round(laborFactor), rationale: 'Packing and moving labor' },
    { label: 'Additional Services', amount: Math.round(servicesFactor), rationale: quote.additional_services?.join(', ') || 'Standard service' }
  ]

  const clarifyingQuestions: ClarifyingQuestion[] = []
  if (!quote.inventory?.fridge) {
    clarifyingQuestions.push({
      id: 'appliances',
      field: 'inventory.appliances',
      question: 'Do you have large appliances (fridge, washing machine) that need special handling?'
    })
  }
  if (!quote.elevatorCurrent) {
    clarifyingQuestions.push({
      id: 'access',
      field: 'access',
      question: 'Are there stairs or access restrictions at pickup location?'
    })
  }

  return { total, breakdown, clarifyingQuestions }
}
