// Supabase Edge Function: distance-matrix
// Fetches driving distance & duration between two Kenyan cities using Google Distance Matrix API
// Expects JSON body: { origins: string[], destinations: string[] }
// Returns { distances: Array<{ origin: string; destination: string; distance_meters: number; duration_seconds: number; text: { distance: string; duration: string } }> }
// Environment variables (configure in Supabase dashboard):
//   GOOGLE_MAPS_API_KEY

import type { ServeHandler } from 'https://deno.land/std@0.177.0/http/server.ts'

interface DistanceMatrixRequest {
  origins: string[]
  destinations: string[]
}

interface DistanceMatrixElement {
  distance: { text: string; value: number }
  duration: { text: string; value: number }
  status: string
}

export const handler: ServeHandler = async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  }

  try {
    const body = (await req.json()) as DistanceMatrixRequest
    if (!body.origins?.length || !body.destinations?.length) {
      return new Response(JSON.stringify({ error: 'origins and destinations arrays required' }), { status: 400, headers })
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing GOOGLE_MAPS_API_KEY' }), { status: 500, headers })
    }

    const originsParam = encodeURIComponent(body.origins.join('|'))
    const destinationsParam = encodeURIComponent(body.destinations.join('|'))
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsParam}&destinations=${destinationsParam}&units=metric&region=ke&key=${apiKey}`

    const resp = await fetch(url)
    if (!resp.ok) {
      const text = await resp.text()
      return new Response(JSON.stringify({ error: 'Upstream error', details: text }), { status: 502, headers })
    }
    const json = await resp.json()

    if (json.status !== 'OK') {
      return new Response(JSON.stringify({ error: 'Distance Matrix error', details: json.status }), { status: 502, headers })
    }

    // Flatten rows/elements
    const distances: any[] = []
    json.rows.forEach((row: { elements: DistanceMatrixElement[] }, i: number) => {
      row.elements.forEach((el: DistanceMatrixElement, j: number) => {
        if (el.status === 'OK') {
          distances.push({
            origin: body.origins[i],
            destination: body.destinations[j],
            distance_meters: el.distance.value,
            duration_seconds: el.duration.value,
            text: {
              distance: el.distance.text,
              duration: el.duration.text
            }
          })
        }
      })
    })

    return new Response(JSON.stringify({ distances }), { status: 200, headers })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: 'Unexpected error', details: String(e) }), { status: 500, headers })
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

const headers = {
  ...corsHeaders,
  'Content-Type': 'application/json'
}

// Deno deploy
Deno.serve(handler)
