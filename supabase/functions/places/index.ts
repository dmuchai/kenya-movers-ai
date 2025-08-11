// Supabase Edge Function: places
// Provides Google Places Autocomplete and Place Details via a single endpoint
// Body:
//   { action: 'autocomplete', input: string }
//   { action: 'details', place_id: string }
// Returns:
//   autocomplete -> { predictions: Array<{ description: string; place_id: string }> }
//   details -> { place_id: string; description: string; formatted_address: string; location: { lat: number; lng: number } }

import type { ServeHandler } from 'https://deno.land/std@0.177.0/http/server.ts'

interface AutocompleteRequest { action: 'autocomplete'; input: string }
interface DetailsRequest { action: 'details'; place_id: string }

type PlacesRequest = AutocompleteRequest | DetailsRequest

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const jsonHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json'
}

export const handler: ServeHandler = async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: jsonHeaders })

  try {
    const body = (await req.json()) as Partial<PlacesRequest>
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing GOOGLE_MAPS_API_KEY' }), { status: 500, headers: jsonHeaders })

    if (body.action === 'autocomplete') {
      const input = (body as AutocompleteRequest).input?.trim() || ''
      if (!input) return new Response(JSON.stringify({ predictions: [] }), { status: 200, headers: jsonHeaders })

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:ke&types=geocode&key=${apiKey}`
      const resp = await fetch(url)
      const json = await resp.json()
      if (!resp.ok) return new Response(JSON.stringify({ error: 'Upstream error', details: json }), { status: 502, headers: jsonHeaders })

      if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
        return new Response(JSON.stringify({ error: 'Places Autocomplete error', details: json.status }), { status: 502, headers: jsonHeaders })
      }

      const predictions = (json.predictions || []).map((p: any) => ({ description: p.description, place_id: p.place_id }))
      return new Response(JSON.stringify({ predictions }), { status: 200, headers: jsonHeaders })
    }

    if (body.action === 'details') {
      const place_id = (body as DetailsRequest).place_id
      if (!place_id) return new Response(JSON.stringify({ error: 'place_id required' }), { status: 400, headers: jsonHeaders })

      const fields = 'formatted_address,geometry,name,place_id'
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place_id)}&fields=${fields}&key=${apiKey}`
      const resp = await fetch(url)
      const json = await resp.json()
      if (!resp.ok) return new Response(JSON.stringify({ error: 'Upstream error', details: json }), { status: 502, headers: jsonHeaders })

      if (json.status !== 'OK') {
        return new Response(JSON.stringify({ error: 'Place Details error', details: json.status }), { status: 502, headers: jsonHeaders })
      }

      const r = json.result
      const payload = {
        place_id: r.place_id,
        description: r.name || r.formatted_address,
        formatted_address: r.formatted_address,
        location: {
          lat: r.geometry?.location?.lat,
          lng: r.geometry?.location?.lng
        }
      }
      return new Response(JSON.stringify(payload), { status: 200, headers: jsonHeaders })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: jsonHeaders })
  } catch (e) {
    console.error('places function error', e)
    return new Response(JSON.stringify({ error: 'Unexpected error', details: String(e) }), { status: 500, headers: jsonHeaders })
  }
}

// Deno deploy
Deno.serve(handler)
