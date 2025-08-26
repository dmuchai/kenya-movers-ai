// Supabase Edge Function: distance-matrix
// Calls Google Maps Distance Matrix API to calculate distances and durations

export interface DistanceMatrixRequest {
  origins: string[]
  destinations: string[]
}

export interface DistanceMatrixResponse {
  distances: Array<{
    origin: string
    destination: string
    distance_meters: number
    duration_seconds: number
    text: {
      distance: string
      duration: string
    }
  }>
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { origins, destinations }: DistanceMatrixRequest = await req.json()
    
    if (!origins?.length || !destinations?.length) {
      return new Response(
        JSON.stringify({ error: 'Origins and destinations are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build the Google Maps Distance Matrix API URL
    const params = new URLSearchParams({
      origins: origins.join('|'),
      destinations: destinations.join('|'),
      units: 'metric',
      key: apiKey
    })

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params}`
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${data.status} - ${data.error_message || 'Unknown error'}`)
    }

    // Parse the response into our format
    const distances: DistanceMatrixResponse['distances'] = []
    
    data.rows.forEach((row: any, originIndex: number) => {
      row.elements.forEach((element: any, destIndex: number) => {
        if (element.status === 'OK') {
          distances.push({
            origin: origins[originIndex],
            destination: destinations[destIndex],
            distance_meters: element.distance.value,
            duration_seconds: element.duration.value,
            text: {
              distance: element.distance.text,
              duration: element.duration.text
            }
          })
        }
      })
    })

    return new Response(
      JSON.stringify({ distances }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Distance Matrix API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to calculate distances', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
