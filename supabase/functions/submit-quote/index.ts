import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log the request for debugging
    console.log('Submit quote function called with method:', req.method)
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment check - URL exists:', !!supabaseUrl, 'Key exists:', !!serviceRoleKey)
    
    if (!supabaseUrl || !serviceRoleKey) {
      const missingVars = []
      if (!supabaseUrl) missingVars.push('SUPABASE_URL')
      if (!serviceRoleKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY')
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
    }
    
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const requestBody = await req.json()
    console.log('Request body received:', JSON.stringify(requestBody, null, 2))
    
    const { quoteData, isAnonymous, contactInfo } = requestBody
    
    if (!quoteData) {
      throw new Error('Missing quoteData in request body')
    }

    // For anonymous quotes, we need to create a temporary auth user
    if (isAnonymous && contactInfo) {
      console.log('Processing anonymous quote - creating temporary user')
      
      try {
        // Create a temporary user with a unique email
        const tempEmail = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@temp.moveeasy.app`
        const tempPassword = crypto.randomUUID()
        
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: tempEmail,
          password: tempPassword,
          email_confirm: true
        })
        
        if (authError || !authData.user) {
          console.error('Failed to create temp user:', authError)
          throw new Error(`Failed to create temporary user: ${authError?.message}`)
        }
        
        console.log('Temporary user created:', authData.user.id)
        
        // Use the new user ID for the quote
        quoteData.user_id = authData.user.id
        
        // Create profile for this temp user
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            full_name: contactInfo.name || 'Guest User',
            email: contactInfo.email || tempEmail,
            phone_number: contactInfo.phone || null,
            preferred_contact_method: contactInfo.email ? 'email' : 'phone'
          })
        
        if (profileError) {
          console.warn('Profile creation failed, continuing without profile:', profileError)
        }
        
        // Add contact information to special_requirements as backup
        const contactDetails = [
          contactInfo.name ? `Name: ${contactInfo.name}` : null,
          contactInfo.email ? `Email: ${contactInfo.email}` : null,
          contactInfo.phone ? `Phone: ${contactInfo.phone}` : null
        ].filter(Boolean).join(' | ')
        
        quoteData.special_requirements = quoteData.special_requirements 
          ? `${quoteData.special_requirements}\n\nContact: ${contactDetails}`
          : `Contact: ${contactDetails}`
          
      } catch (err) {
        console.error('Error creating temporary user:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        throw new Error(`Failed to create anonymous user: ${errorMessage}`)
      }
    }

    console.log('Final quote data to insert:', JSON.stringify(quoteData, null, 2))

    // Insert the quote using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('quotes')
      .insert(quoteData)
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }
    
    console.log('Quote inserted successfully:', JSON.stringify(data, null, 2))

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        message: isAnonymous ? 'Anonymous quote submitted successfully' : 'Quote submitted successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in submit-quote function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error
    
    console.error('Full error details:', JSON.stringify(errorDetails, null, 2))
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})