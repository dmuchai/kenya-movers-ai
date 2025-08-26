// Supabase Edge Function: whatsapp-message
// Send WhatsApp messages via WhatsApp Business API

export interface WhatsAppMessageRequest {
  to: string
  text?: string
  template?: {
    name: string
    language: string
    components?: any[]
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: jsonHeaders })

  try {
    const { to, text, template }: WhatsAppMessageRequest = await req.json()
    
    if (!to) {
      return new Response(JSON.stringify({ error: 'Phone number is required' }), { status: 400, headers: jsonHeaders })
    }

    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
      // Return mock success for development
      console.log('WhatsApp credentials not configured, returning mock response')
      return new Response(JSON.stringify({ 
        success: true, 
        data: { 
          message: 'WhatsApp message would be sent in production',
          to,
          text: text || 'Template message'
        }
      }), { status: 200, headers: jsonHeaders })
    }

    // Format phone number (remove + and ensure country code)
    const phoneNumber = to.replace(/[^\d]/g, '').replace(/^0/, '254')

    let messageBody: any

    if (template) {
      // Template message
      messageBody = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: template.name,
          language: { code: template.language },
          components: template.components || []
        }
      }
    } else if (text) {
      // Text message
      messageBody = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: text }
      }
    } else {
      return new Response(JSON.stringify({ error: 'Either text or template is required' }), { status: 400, headers: jsonHeaders })
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageBody)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${result.error?.message || 'Unknown error'}`)
    }

    return new Response(JSON.stringify({ success: true, data: result }), { status: 200, headers: jsonHeaders })

  } catch (error) {
    console.error('WhatsApp Message Error:', error)
    return new Response(JSON.stringify({ error: 'Failed to send message', details: error.message }), { status: 500, headers: jsonHeaders })
  }
})
