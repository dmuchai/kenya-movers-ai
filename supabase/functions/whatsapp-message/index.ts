// Supabase Edge Function: whatsapp-message
// Sends a WhatsApp message via Meta WhatsApp Cloud API
// POST body: { to: string (E.164), template?: { name: string; language: string; components?: any[] }, text?: string }
// Requires environment variables: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck // Supabase edge function executed in Deno runtime; ambient Deno global is available

interface WhatsAppRequestBody {
  to: string
  template?: { name: string; language: string; components?: any[] }
  text?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

const headersBase = {
  ...corsHeaders,
  'Content-Type': 'application/json'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: headersBase })
  }

  try {
    const body = (await req.json()) as WhatsAppRequestBody
    if (!body.to) {
      return new Response(JSON.stringify({ error: 'Missing to' }), { status: 400, headers: headersBase })
    }

    const token = Deno.env.get('WHATSAPP_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    const graphVersion = Deno.env.get('WHATSAPP_GRAPH_VERSION') || 'v22.0'
    if (!token || !phoneNumberId) {
      return new Response(JSON.stringify({ error: 'Missing WhatsApp credentials' }), { status: 500, headers: headersBase })
    }
    // Basic MSISDN normalization: strip non-digits, remove leading +, do not auto-add country code (caller should provide full E.164)
    const msisdn = body.to.replace(/[^0-9]/g, '')
    if (msisdn.length < 8) {
      return new Response(JSON.stringify({ error: 'Recipient number too short after normalization' }), { status: 400, headers: headersBase })
    }

    const url = `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`

    let payload: any
    if (body.template) {
      payload = {
        messaging_product: 'whatsapp',
  to: msisdn,
        type: 'template',
        template: {
          name: body.template.name,
          language: { code: body.template.language },
          components: body.template.components || []
        }
      }
    } else if (body.text) {
      payload = {
        messaging_product: 'whatsapp',
  to: msisdn,
        type: 'text',
        text: { body: body.text }
      }
    } else {
      return new Response(JSON.stringify({ error: 'Provide template or text' }), { status: 400, headers: headersBase })
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await resp.json()
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: 'WhatsApp API error', details: data }), { status: resp.status, headers: headersBase })
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: headersBase })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Unexpected error', details: String(e) }), { status: 500, headers: headersBase })
  }
})
