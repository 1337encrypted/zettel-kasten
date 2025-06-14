
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const domain = email.split('@')[1];
    if (!domain) {
      return new Response(JSON.stringify({ isValid: false, message: 'Invalid email format' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    try {
      const mxRecords = await Deno.resolveDns(domain, 'MX');
      if (mxRecords.length === 0) {
        return new Response(JSON.stringify({ isValid: false, message: 'This email domain does not seem to exist.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
    } catch (error) {
       console.error(`DNS resolution failed for ${domain}:`, error.message);
       if (error instanceof Deno.errors.NotFound) {
         return new Response(JSON.stringify({ isValid: false, message: 'This email domain does not seem to exist.' }), {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           status: 200,
         });
       }
       // For other network errors, let the signup proceed as we cannot be sure.
    }

    return new Response(JSON.stringify({ isValid: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in validate-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
