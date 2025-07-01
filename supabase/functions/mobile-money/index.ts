import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MoMoPaymentRequest {
  amount: number
  currency: string
  phone: string
  provider: 'mtn' | 'orange' | 'airtel'
  reference: string
  description?: string
}

interface MoMoPaymentResponse {
  success: boolean
  transaction_id?: string
  status: 'pending' | 'completed' | 'failed'
  message: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    if (req.method === 'POST') {
      const { amount, currency, phone, provider, reference, description }: MoMoPaymentRequest = await req.json()

      // Validate input
      if (!amount || !currency || !phone || !provider || !reference) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Simulate Mobile Money API integration
      // In production, integrate with actual MoMo APIs (MTN MoMo, Orange Money, etc.)
      const mockMoMoResponse = await processMobileMoneyPayment({
        amount,
        currency,
        phone,
        provider,
        reference,
        description
      })

      // Save transaction to database
      const { data: transaction, error: dbError } = await supabaseClient
        .from('momo_transactions_2024')
        .insert({
          reference,
          phone,
          provider,
          amount,
          currency,
          status: mockMoMoResponse.status,
          transaction_id: mockMoMoResponse.transaction_id,
          description: description || 'Medical tourism payment',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        return new Response(
          JSON.stringify({ error: 'Failed to save transaction' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: mockMoMoResponse.success,
          transaction: transaction,
          status: mockMoMoResponse.status,
          message: mockMoMoResponse.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // GET request - Check transaction status
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const reference = url.searchParams.get('reference')

      if (!reference) {
        return new Response(
          JSON.stringify({ error: 'Reference parameter required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const { data: transaction, error } = await supabaseClient
        .from('momo_transactions_2024')
        .select('*')
        .eq('reference', reference)
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Transaction not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify(transaction),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Mock Mobile Money API integration
async function processMobileMoneyPayment(request: MoMoPaymentRequest): Promise<MoMoPaymentResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Mock different provider responses
  const providerConfigs = {
    mtn: { successRate: 0.9, apiEndpoint: 'https://sandbox.momodeveloper.mtn.com' },
    orange: { successRate: 0.85, apiEndpoint: 'https://api.orange.com/orange-money' },
    airtel: { successRate: 0.88, apiEndpoint: 'https://openapiuat.airtel.africa' }
  }

  const config = providerConfigs[request.provider]
  const isSuccess = Math.random() < config.successRate

  if (isSuccess) {
    return {
      success: true,
      transaction_id: `${request.provider.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      message: `Payment initiated successfully via ${request.provider.toUpperCase()} Mobile Money`
    }
  } else {
    return {
      success: false,
      status: 'failed',
      message: `Payment failed - insufficient balance or network error`
    }
  }
}