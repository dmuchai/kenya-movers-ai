// Supabase Edge Function: places
// Google Places API integration for location autocomplete and details

export interface AutocompleteRequest {
  action: 'autocomplete'
  input: string
  components?: string
  types?: string
}

export interface PlaceDetailsRequest {
  action: 'details'
  place_id: string
  fields?: string
}

type PlacesRequest = AutocompleteRequest | PlaceDetailsRequest

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: jsonHeaders })

  try {
    const body = (await req.json()) as Partial<PlacesRequest>
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing GOOGLE_MAPS_API_KEY' }), { status: 500, headers: jsonHeaders })

    if (body.action === 'autocomplete') {
      const input = (body as AutocompleteRequest).input?.trim() || ''
      if (!input) return new Response(JSON.stringify({ predictions: [] }), { status: 200, headers: jsonHeaders })

      console.log(`[Places API] Searching for: "${input}"`)

      // Try legacy Places Autocomplete API first (most reliable)
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:ke&key=${apiKey}`
        console.log(`[Places API] Trying legacy autocomplete: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`)
        
        const resp = await fetch(url)
        const json = await resp.json()
        console.log(`[Places API] Legacy autocomplete response:`, json)
        
        if (json.status === 'OK' && json.predictions) {
          const predictions = json.predictions.slice(0, 5).map((pred: any) => ({
            description: pred.description,
            place_id: pred.place_id
          }))
          console.log(`[Places API] Returning ${predictions.length} legacy predictions`)
          return new Response(JSON.stringify({ predictions }), { status: 200, headers: jsonHeaders })
        } else {
          console.warn(`[Places API] Legacy autocomplete failed with status: ${json.status}, error: ${json.error_message}`)
        }
      } catch (e) {
        console.error('[Places API] Legacy autocomplete error:', e)
      }

      // Try new Places API as fallback
      try {
        const url = `https://places.googleapis.com/v1/places:searchText`
        const requestBody = {
          textQuery: input,
          regionCode: "KE",
          maxResultCount: 5
        }

        console.log(`[Places API] Trying new Places API`)
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
          },
          body: JSON.stringify(requestBody)
        })
        
        if (resp.ok) {
          const json = await resp.json()
          console.log(`[Places API] New API response:`, json)
          const predictions = (json.places || []).map((place: any) => ({
            description: place.formattedAddress || place.displayName?.text || '',
            place_id: place.id
          }))
          console.log(`[Places API] Returning ${predictions.length} new API predictions`)
          return new Response(JSON.stringify({ predictions }), { status: 200, headers: jsonHeaders })
        } else {
          const errorText = await resp.text()
          console.warn(`[Places API] New API failed with status ${resp.status}: ${errorText}`)
        }
      } catch (e) {
        console.error('[Places API] New API error:', e)
      }

      // Fallback to Geocoding API
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(input)}&components=country:KE&key=${apiKey}`
        console.log(`[Places API] Trying geocoding fallback`)
        const resp = await fetch(url)
        const json = await resp.json()
        console.log(`[Places API] Geocoding response:`, json)
        
        if (json.status === 'OK') {
          const predictions = json.results.slice(0, 5).map((result: any, index: number) => ({
            description: result.formatted_address,
            place_id: result.place_id || `geo_${index}_${Date.now()}`
          }))
          console.log(`[Places API] Returning ${predictions.length} geocoding predictions`)
          return new Response(JSON.stringify({ predictions }), { status: 200, headers: jsonHeaders })
        } else {
          console.warn(`[Places API] Geocoding failed with status: ${json.status}, error: ${json.error_message}`)
        }
      } catch (e) {
        console.error('[Places API] Geocoding error:', e)
      }

      // Final fallback - return static Kenya locations
      console.log(`[Places API] Using static fallback for: "${input}"`)
      const kenyaLocations = [
        { description: "Nairobi, Kenya", place_id: "static_nairobi" },
        { description: "Mombasa, Kenya", place_id: "static_mombasa" },
        { description: "Kisumu, Kenya", place_id: "static_kisumu" },
        { description: "Nakuru, Kenya", place_id: "static_nakuru" },
        { description: "Eldoret, Kenya", place_id: "static_eldoret" },
        { description: "Kitengela, Kenya", place_id: "static_kitengela" },
        { description: "Thika, Kenya", place_id: "static_thika" },
        { description: "Machakos, Kenya", place_id: "static_machakos" },
        { description: "Nyeri, Kenya", place_id: "static_nyeri" },
        { description: "Meru, Kenya", place_id: "static_meru" }
      ].filter(loc => loc.description.toLowerCase().includes(input.toLowerCase()))

      return new Response(JSON.stringify({ predictions: kenyaLocations }), { status: 200, headers: jsonHeaders })
    }

    if (body.action === 'details') {
      const placeId = (body as PlaceDetailsRequest).place_id
      if (!placeId) return new Response(JSON.stringify({ error: 'Missing place_id' }), { status: 400, headers: jsonHeaders })

      // Handle static locations
      if (placeId.startsWith('static_')) {
        const staticLocations: Record<string, any> = {
          'static_nairobi': {
            place_id: placeId,
            description: 'Nairobi, Kenya',
            formatted_address: 'Nairobi, Kenya',
            location: { lat: -1.2921, lng: 36.8219 }
          },
          'static_mombasa': {
            place_id: placeId,
            description: 'Mombasa, Kenya',
            formatted_address: 'Mombasa, Kenya',
            location: { lat: -4.0435, lng: 39.6682 }
          },
          'static_kisumu': {
            place_id: placeId,
            description: 'Kisumu, Kenya',
            formatted_address: 'Kisumu, Kenya',
            location: { lat: -0.0917, lng: 34.7680 }
          },
          'static_nakuru': {
            place_id: placeId,
            description: 'Nakuru, Kenya',
            formatted_address: 'Nakuru, Kenya',
            location: { lat: -0.3031, lng: 36.0800 }
          },
          'static_eldoret': {
            place_id: placeId,
            description: 'Eldoret, Kenya',
            formatted_address: 'Eldoret, Kenya',
            location: { lat: 0.5143, lng: 35.2698 }
          },
          'static_kitengela': {
            place_id: placeId,
            description: 'Kitengela, Kenya',
            formatted_address: 'Kitengela, Kenya',
            location: { lat: -1.4667, lng: 36.9500 }
          },
          'static_thika': {
            place_id: placeId,
            description: 'Thika, Kenya',
            formatted_address: 'Thika, Kenya',
            location: { lat: -1.0332, lng: 37.0691 }
          },
          'static_machakos': {
            place_id: placeId,
            description: 'Machakos, Kenya',
            formatted_address: 'Machakos, Kenya',
            location: { lat: -1.5177, lng: 37.2634 }
          },
          'static_nyeri': {
            place_id: placeId,
            description: 'Nyeri, Kenya',
            formatted_address: 'Nyeri, Kenya',
            location: { lat: -0.4167, lng: 36.9500 }
          },
          'static_meru': {
            place_id: placeId,
            description: 'Meru, Kenya',
            formatted_address: 'Meru, Kenya',
            location: { lat: 0.0500, lng: 37.6500 }
          }
        }
        
        const location = staticLocations[placeId]
        if (location) {
          return new Response(JSON.stringify(location), { status: 200, headers: jsonHeaders })
        }
      }

      // Try new Places API first
      try {
        const url = `https://places.googleapis.com/v1/${placeId}`
        const resp = await fetch(url, {
          method: 'GET',
          headers: {
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'id,displayName,formattedAddress,location'
          }
        })
        
        if (resp.ok) {
          const json = await resp.json()
          const transformedResponse = {
            place_id: placeId,
            description: json.displayName?.text || json.formattedAddress,
            formatted_address: json.formattedAddress,
            location: {
              lat: json.location?.latitude || 0,
              lng: json.location?.longitude || 0
            }
          }
          return new Response(JSON.stringify(transformedResponse), { status: 200, headers: jsonHeaders })
        }
      } catch (e) {
        console.warn('New Places API failed for details:', e)
      }

      // Fallback to geocoding for place_id lookup
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${apiKey}`
        const resp = await fetch(url)
        const json = await resp.json()
        
        if (json.status === 'OK' && json.results.length > 0) {
          const result = json.results[0]
          const transformedResponse = {
            place_id: placeId,
            description: result.formatted_address,
            formatted_address: result.formatted_address,
            location: {
              lat: result.geometry?.location?.lat || 0,
              lng: result.geometry?.location?.lng || 0
            }
          }
          return new Response(JSON.stringify(transformedResponse), { status: 200, headers: jsonHeaders })
        }
      } catch (e) {
        console.warn('Geocoding API failed for details:', e)
      }

      // Final fallback
      return new Response(JSON.stringify({
        place_id: placeId,
        description: 'Location in Kenya',
        formatted_address: 'Kenya',
        location: { lat: -1.2921, lng: 36.8219 } // Nairobi coordinates
      }), { status: 200, headers: jsonHeaders })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: jsonHeaders })

  } catch (error) {
    console.error('Places API Error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process request', details: error.message }), { status: 500, headers: jsonHeaders })
  }
})
