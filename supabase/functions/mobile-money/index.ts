import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface PaymentRequest {
  userId: string
  amount: number
  provider: 'mtn' | 'orange' | 'airtel'
  phone: string
  currency?: string
  description?: string
}

interface PaymentResponse {
  success: boolean
  payment_ref: string
  checkout_uri: string
  message: string
}

interface WebhookPayload {
  payment_ref: string
  status: 'paid' | 'failed' | 'cancelled'
  transaction_id?: string
  amount?: number
  currency?: string
}

// MTN MoMo Sandbox Configuration
const MTN_MOMO_CONFIG = {
  baseUrl: 'https://sandbox.momodeveloper.mtn.com',
  subscriptionKey: Deno.env.get('MTN_MOMO_SUBSCRIPTION_KEY') || 'demo-key',
  userId: Deno.env.get('MTN_MOMO_USER_ID') || 'demo-user',
  apiKey: Deno.env.get('MTN_MOMO_API_KEY') || 'demo-api-key',
  targetEnvironment: 'sandbox'
}

// Orange Money Configuration
const ORANGE_CONFIG = {
  baseUrl: 'https://api.orange.com/orange-money-webpay/dev/v1',
  clientId: Deno.env.get('ORANGE_CLIENT_ID') || 'demo-client',
  clientSecret: Deno.env.get('ORANGE_CLIENT_SECRET') || 'demo-secret'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const path = url.pathname

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Payment Initiation Endpoint
    if (path === '/mobile-money/pay' && req.method === 'POST') {
      return await handlePaymentRequest(req, supabaseClient)
    }

    // Webhook Handler
    if (path === '/mobile-money/webhook' && req.method === 'POST') {
      return await handleWebhook(req, supabaseClient)
    }

    // Payment Status Check
    if (path === '/mobile-money/status' && req.method === 'GET') {
      return await handleStatusCheck(req, supabaseClient)
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Handle Payment Request
async function handlePaymentRequest(req: Request, supabaseClient: any): Promise<Response> {
  try {
    // Validate JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid JWT token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { userId, amount, provider, phone, currency = 'USD', description = 'Medical tourism payment' }: PaymentRequest = await req.json()

    // Validate input
    if (!userId || !amount || !provider || !phone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, amount, provider, phone' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate payment reference
    const payment_ref = `EMIRAFRIK_${provider.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Process payment with provider
    let paymentResult: PaymentResponse
    
    switch (provider) {
      case 'mtn':
        paymentResult = await processMTNPayment({ payment_ref, amount, phone, currency, description })
        break
      case 'orange':
        paymentResult = await processOrangePayment({ payment_ref, amount, phone, currency, description })
        break
      case 'airtel':
        paymentResult = await processAirtelPayment({ payment_ref, amount, phone, currency, description })
        break
      default:
        throw new Error('Unsupported payment provider')
    }

    // Insert payment record into database
    const { data: payment, error: dbError } = await supabaseClient
      .from('payments')
      .insert({
        id: payment_ref,
        user_id: userId,
        amount: amount,
        currency: currency,
        provider: provider,
        phone: phone,
        status: 'pending',
        checkout_uri: paymentResult.checkout_uri,
        description: description,
        created_at: new Date().toISOString(),
        metadata: {
          external_ref: paymentResult.payment_ref,
          provider_response: paymentResult
        }
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to save payment record' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_ref: payment_ref,
        checkout_uri: paymentResult.checkout_uri,
        message: `Payment initiated successfully with ${provider.toUpperCase()}`,
        status: 'pending'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Payment request error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Payment initiation failed',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle Webhook Notifications
async function handleWebhook(req: Request, supabaseClient: any): Promise<Response> {
  try {
    const webhookData: WebhookPayload = await req.json()
    
    console.log('Webhook received:', webhookData)

    const { payment_ref, status, transaction_id, amount, currency } = webhookData

    if (!payment_ref || !status) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update payment status in database
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString()
    }

    if (transaction_id) {
      updateData.transaction_id = transaction_id
    }

    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString()
    }

    const { data: payment, error: updateError } = await supabaseClient
      .from('payments')
      .update(updateData)
      .eq('id', payment_ref)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update payment status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Send notification to user if payment is successful
    if (status === 'paid' && payment) {
      await sendPaymentNotification(supabaseClient, payment)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Webhook processing failed',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle Payment Status Check
async function handleStatusCheck(req: Request, supabaseClient: any): Promise<Response> {
  const url = new URL(req.url)
  const payment_ref = url.searchParams.get('payment_ref')
  const user_id = url.searchParams.get('user_id')

  if (!payment_ref || !user_id) {
    return new Response(
      JSON.stringify({ error: 'Missing payment_ref or user_id parameter' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { data: payment, error } = await supabaseClient
    .from('payments')
    .select('*')
    .eq('id', payment_ref)
    .eq('user_id', user_id)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Payment not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({
      payment_ref: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
      created_at: payment.created_at,
      paid_at: payment.paid_at,
      transaction_id: payment.transaction_id
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// MTN MoMo Payment Processing
async function processMTNPayment(params: any): Promise<PaymentResponse> {
  try {
    // In production, implement actual MTN MoMo API calls
    // For now, simulate the response
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

    const isSuccess = Math.random() > 0.1 // 90% success rate for demo

    if (isSuccess) {
      return {
        success: true,
        payment_ref: params.payment_ref,
        checkout_uri: `mtn://pay?ref=${params.payment_ref}&amount=${params.amount}`,
        message: 'Payment initiated successfully with MTN MoMo'
      }
    } else {
      throw new Error('MTN MoMo payment initiation failed')
    }
  } catch (error) {
    throw new Error(`MTN payment failed: ${error.message}`)
  }
}

// Orange Money Payment Processing
async function processOrangePayment(params: any): Promise<PaymentResponse> {
  try {
    await new Promise(resolve => setTimeout(resolve, 800))

    const isSuccess = Math.random() > 0.15 // 85% success rate for demo

    if (isSuccess) {
      return {
        success: true,
        payment_ref: params.payment_ref,
        checkout_uri: `orange://pay?ref=${params.payment_ref}&amount=${params.amount}`,
        message: 'Payment initiated successfully with Orange Money'
      }
    } else {
      throw new Error('Orange Money payment initiation failed')
    }
  } catch (error) {
    throw new Error(`Orange payment failed: ${error.message}`)
  }
}

// Airtel Money Payment Processing
async function processAirtelPayment(params: any): Promise<PaymentResponse> {
  try {
    await new Promise(resolve => setTimeout(resolve, 1200))

    const isSuccess = Math.random() > 0.12 // 88% success rate for demo

    if (isSuccess) {
      return {
        success: true,
        payment_ref: params.payment_ref,
        checkout_uri: `airtel://pay?ref=${params.payment_ref}&amount=${params.amount}`,
        message: 'Payment initiated successfully with Airtel Money'
      }
    } else {
      throw new Error('Airtel Money payment initiation failed')
    }
  } catch (error) {
    throw new Error(`Airtel payment failed: ${error.message}`)
  }
}

// Send payment notification
async function sendPaymentNotification(supabaseClient: any, payment: any) {
  try {
    // Insert notification record
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: payment.user_id,
        type: 'payment_success',
        title: 'Payment Successful',
        message: `Your payment of ${payment.amount} ${payment.currency} has been processed successfully.`,
        data: {
          payment_ref: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          provider: payment.provider
        },
        created_at: new Date().toISOString()
      })

    console.log('Payment notification sent for:', payment.id)
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
}