// Service layer for calling Supabase Edge Functions and GPT estimator
import { supabase } from '@/integrations/supabase/client'

// NOTE: For public edge functions, supabase.functions.invoke is used.
// distance-matrix
export async function fetchDistanceMatrix(origins: string[], destinations: string[]) {
  const { data, error } = await supabase.functions.invoke('distance-matrix', {
    body: { origins, destinations }
  })
  if (error) throw error
  return data as { distances: Array<{ origin: string; destination: string; distance_meters: number; duration_seconds: number; text: { distance: string; duration: string } }> }
}

// whatsapp-message
export async function sendWhatsAppMessage(params: { to: string; text?: string; template?: { name: string; language: string; components?: any[] } }) {
  const { data, error } = await supabase.functions.invoke('whatsapp-message', {
    body: params
  })
  if (error) throw error
  return data as { success: boolean; data: any }
}

// GPT clarifying questions + estimator stub
// This can later be replaced with an edge function calling OpenAI or Anthropic.
export interface ClarifyingQuestion {
  id: string
  question: string
  field: string
}

export interface EstimationBreakdownItem {
  label: string
  amount: number
  rationale: string
}

export interface AIQuoteEstimation {
  base: number
  distanceFactor: number
  laborFactor: number
  inventoryFactor: number
  servicesFactor: number
  total: number
  breakdown: EstimationBreakdownItem[]
  clarifyingQuestions?: ClarifyingQuestion[]
}

export function generateAIQuoteEstimation(input: any & { distance_meters?: number }) : AIQuoteEstimation {
  // Heuristic pricing model (to be replaced with real AI)
  const base = 12000
  const distanceKm = (input.distance_meters || 0) / 1000
  const distanceFactor = Math.max(1, distanceKm / 10) * 1500

  const sizeMultipliers: Record<string, number> = {
    'Bedsitter': 0.7, '1BR': 1, '2BR': 1.4, '3BR': 1.8, '4BR': 2.2, '5BR+': 2.8, 'Maisonette': 2.5, 'Villa': 3.2
  }
  const laborFactor = (sizeMultipliers[input.propertySize] || 1) * 4000

  const inventory = input.inventory || {}
  const inventoryCount = (inventory.beds||0) + (inventory.wardrobe||0) + (inventory.sofaSeats||0) + ((inventory.boxes||0) * 0.1)
  const inventoryFactor = inventoryCount * 600

  const servicesFactor = (input.additionalServices?.length || 0) * 1500

  const total = Math.round(base + distanceFactor + laborFactor + inventoryFactor + servicesFactor)

  const breakdown: EstimationBreakdownItem[] = [
    { label: 'Base', amount: base, rationale: 'Minimum operational cost' },
    { label: 'Distance', amount: Math.round(distanceFactor), rationale: `${distanceKm.toFixed(1)} km route` },
    { label: 'Labor', amount: Math.round(laborFactor), rationale: `Property size ${input.propertySize}` },
    { label: 'Inventory', amount: Math.round(inventoryFactor), rationale: 'Volume & handling complexity' },
    { label: 'Services', amount: Math.round(servicesFactor), rationale: 'Additional selected services' }
  ]

  const clarifyingQuestions: ClarifyingQuestion[] = []
  if (!inventory.fridge) clarifyingQuestions.push({ id: 'fragile', field: 'inventory.fragile', question: 'Are there fragile or high-value items (glass, art, electronics) needing special packing?' })
  if (!input.elevatorCurrent || !input.elevatorDestination) clarifyingQuestions.push({ id: 'staircases', field: 'access', question: 'Are there narrow staircases or access restrictions we should know about?' })
  if (!input.movingDate) clarifyingQuestions.push({ id: 'flex-date', field: 'movingDate', question: 'Is your moving date flexible within a 3-day window?' })

  return { base, distanceFactor: Math.round(distanceFactor), laborFactor: Math.round(laborFactor), inventoryFactor: Math.round(inventoryFactor), servicesFactor: Math.round(servicesFactor), total, breakdown, clarifyingQuestions }
}

// Invoke server-side OpenAI estimator edge function, fallback to heuristic on failure.
export async function invokeAIQuoteEstimation(input: any & { distance_meters?: number }) : Promise<AIQuoteEstimation> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-estimator', {
      body: { quote: input, distance_meters: input.distance_meters }
    })
    if (error) throw error
    const estimation = data?.estimation
    if (!estimation) throw new Error('No estimation in response')
    // Normalize fields, ensure required numbers
    return {
      base: 0,
      distanceFactor: 0,
      laborFactor: 0,
      inventoryFactor: 0,
      servicesFactor: 0,
      breakdown: estimation.breakdown || [],
      clarifyingQuestions: estimation.clarifyingQuestions || [],
      total: estimation.total || 0
    }
  } catch (e) {
    console.warn('AI estimator edge function failed, using heuristic', e)
    return generateAIQuoteEstimation(input)
  }
}
