// Mercado Pago integration for Tu Futuro Auto

const PLAN_PRICES: Record<string, number> = {
  basico: 50000,
  pro: 90000,
  elite: 150000,
}

interface PaymentLinkParams {
  plan: string
  marca: string
  modelo: string
  año: string
  email: string
  submissionId: string
}

export async function createPaymentLink(params: PaymentLinkParams): Promise<string | null> {
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  if (!accessToken) {
    console.error('MERCADOPAGO_ACCESS_TOKEN not set')
    return null
  }

  const price = PLAN_PRICES[params.plan]
  if (!price) {
    console.error(`Unknown plan: ${params.plan}`)
    return null
  }

  const planName = params.plan.charAt(0).toUpperCase() + params.plan.slice(1)

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            id: params.submissionId,
            title: `Plan ${planName} - Tu Futuro Auto`,
            description: `Publicación de ${params.marca} ${params.modelo} ${params.año}`,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: price,
          },
        ],
        payer: {
          email: params.email,
        },
        back_urls: {
          success: `${Deno.env.get('FRONTEND_URL') || 'https://tufuturoauto.com'}/pago-exitoso`,
          failure: `${Deno.env.get('FRONTEND_URL') || 'https://tufuturoauto.com'}/pago-fallido`,
          pending: `${Deno.env.get('FRONTEND_URL') || 'https://tufuturoauto.com'}/pago-pendiente`,
        },
        auto_return: 'approved',
        external_reference: params.submissionId,
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-5cf66d9e/webhook/mercadopago`,
        statement_descriptor: 'TU FUTURO AUTO',
        expires: false,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('MercadoPago error:', err)
      return null
    }

    const data = await response.json()
    return data.init_point || data.sandbox_init_point || null
  } catch (error) {
    console.error('Error creating payment link:', error)
    return null
  }
}

export async function verifyWebhookPayment(paymentId: string): Promise<{
  status: string
  external_reference: string
} | null> {
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  if (!accessToken) return null

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })

    if (!response.ok) return null
    const data = await response.json()

    return {
      status: data.status,
      external_reference: data.external_reference,
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    return null
  }
}
