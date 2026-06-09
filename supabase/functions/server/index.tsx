import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createPaymentLink, verifyWebhookPayment } from './mercadopago.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const TABLE = 'kv_store_5cf66d9e'
const BUCKET = 'make-5cf66d9e-photos'

function getSupabase() {
  return createClient(
    Deno.env.get('DB_URL') ?? Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SERVICE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

async function getAllSubmissions(supabase: ReturnType<typeof getSupabase>) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('key, value, created_at')
    .like('key', 'submission_%')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map((row: { key: string; value: Record<string, unknown>; created_at: string }) => ({
    id: row.key,
    ...row.value,
    timestamp: row.value.timestamp || row.created_at,
  }))
}

async function signPhotoUrls(supabase: ReturnType<typeof getSupabase>, submission: Record<string, unknown>) {
  const photos = (submission.photos as Array<{ path: string; url?: string; name: string; size: number; type: string; index: number }>) || []
  const video = submission.video as { path: string; url?: string; name: string; size: number; type: string } | null

  const signedPhotos = await Promise.all(
    photos.map(async (photo) => {
      if (!photo.path) return photo
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(photo.path, 60 * 60 * 24 * 365)
      return { ...photo, url: data?.signedUrl || photo.url || '' }
    })
  )

  let signedVideo = video
  if (video?.path) {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(video.path, 60 * 60 * 24 * 365)
    signedVideo = { ...video, url: data?.signedUrl || video.url || '' }
  }

  return { ...submission, photos: signedPhotos, video: signedVideo }
}

async function handleSubmitPublication(req: Request): Promise<Response> {
  try {
    const supabase = getSupabase()
    const formData = await req.formData()
    const submissionId = `submission_${Date.now()}`
    const fields: Record<string, string> = {}
    const photoFiles: File[] = []
    let videoFile: File | null = null

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('photo_') && value instanceof File) photoFiles.push(value)
      else if (key === 'video' && value instanceof File) videoFile = value
      else if (typeof value === 'string') fields[key] = value
    }

    const uploadedPhotos: Array<{ name: string; size: number; type: string; index: number; path: string; url: string }> = []

    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i]
      const path = `${submissionId}/photo_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const buffer = await file.arrayBuffer()
      const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: file.type })
      if (!error) {
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 365)
        uploadedPhotos.push({ name: file.name, size: file.size, type: file.type, index: i, path, url: signed?.signedUrl || '' })
      }
    }

    let uploadedVideo: { name: string; size: number; type: string; path: string; url: string } | null = null
    if (videoFile) {
      const path = `${submissionId}/video_${videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const buffer = await videoFile.arrayBuffer()
      const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: videoFile.type })
      if (!error) {
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 365)
        uploadedVideo = { name: videoFile.name, size: videoFile.size, type: videoFile.type, path, url: signed?.signedUrl || '' }
      }
    }

    const submission = {
      id: submissionId,
      timestamp: new Date().toISOString(),
      status: 'pending',
      formData: fields,
      photos: uploadedPhotos,
      video: uploadedVideo,
    }

    const { error: dbError } = await supabase.from(TABLE).insert({ key: submissionId, value: submission })
    if (dbError) throw dbError

    let paymentLink: string | null = null
    if (fields.paymentMethod === 'mercadopago' && fields.plan !== 'manual') {
      paymentLink = await createPaymentLink({
        plan: fields.plan, marca: fields.marca, modelo: fields.modelo,
        año: fields.año, email: fields.email, submissionId,
      })
    }

    return json({
      success: true,
      message: 'Publicación recibida exitosamente',
      data: {
        submissionId,
        summary: { marca: fields.marca, modelo: fields.modelo, plan: fields.plan, photos: uploadedPhotos.length },
        paymentLink,
        paymentMethod: fields.paymentMethod,
        note: paymentLink ? 'Redirigí al usuario al link de pago' : 'La publicación fue recibida. El pago se coordinará por otro medio.',
      },
    })
  } catch (error) {
    console.error('Error in submit-publication:', error)
    return json({ success: false, message: 'Error interno del servidor' }, 500)
  }
}

async function handleGetSubmissions(): Promise<Response> {
  try {
    const supabase = getSupabase()
    const rawSubmissions = await getAllSubmissions(supabase)
    const submissions = await Promise.all(rawSubmissions.map(s => signPhotoUrls(supabase, s as Record<string, unknown>)))
    return json({ success: true, count: submissions.length, submissions })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return json({ success: false, message: 'Error al obtener publicaciones' }, 500)
  }
}

async function handleGetSubmission(id: string): Promise<Response> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.from(TABLE).select('key, value, created_at').eq('key', id).single()
    if (error || !data) return json({ success: false, message: 'Publicación no encontrada' }, 404)
    const submission = await signPhotoUrls(supabase, {
      id: data.key,
      ...(data.value as Record<string, unknown>),
      timestamp: (data.value as Record<string, unknown>).timestamp || data.created_at,
    })
    return json({ success: true, submission })
  } catch (error) {
    console.error('Error fetching submission:', error)
    return json({ success: false, message: 'Error al obtener la publicación' }, 500)
  }
}

async function handleUpdateStatus(req: Request, id: string): Promise<Response> {
  try {
    const supabase = getSupabase()
    const { status } = await req.json()
    if (!['published', 'unpublished', 'pending'].includes(status)) return json({ success: false, message: 'Estado inválido' }, 400)
    const { data, error } = await supabase.from(TABLE).select('value').eq('key', id).single()
    if (error || !data) return json({ success: false, message: 'Publicación no encontrada' }, 404)
    const updated = { ...(data.value as Record<string, unknown>), status, statusUpdatedAt: new Date().toISOString() }
    const { error: updateError } = await supabase.from(TABLE).update({ value: updated }).eq('key', id)
    if (updateError) throw updateError
    return json({ success: true, message: 'Estado actualizado exitosamente', submission: { id, ...updated } })
  } catch (error) {
    console.error('Error updating status:', error)
    return json({ success: false, message: 'Error al actualizar el estado' }, 500)
  }
}

async function handleMercadoPagoWebhook(req: Request): Promise<Response> {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    if (body.type !== 'payment') return json({ received: true })
    const paymentId = body.data?.id
    if (!paymentId) return json({ received: true })
    const payment = await verifyWebhookPayment(String(paymentId))
    if (!payment) return json({ received: true })
    const submissionId = payment.external_reference
    if (!submissionId) return json({ received: true })
    const statusMap: Record<string, string> = { approved: 'paid', rejected: 'payment_failed', pending: 'payment_pending', in_process: 'payment_pending' }
    const newStatus = statusMap[payment.status] || 'payment_pending'
    const { data } = await supabase.from(TABLE).select('value').eq('key', submissionId).single()
    if (!data) return json({ received: true })
    const updated = { ...(data.value as Record<string, unknown>), status: newStatus, paymentStatus: payment.status, paymentId: String(paymentId), paymentDate: new Date().toISOString() }
    await supabase.from(TABLE).update({ value: updated }).eq('key', submissionId)
    return json({ received: true, status: newStatus })
  } catch (error) {
    console.error('Webhook error:', error)
    return json({ received: true })
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/functions\/v1\/make-server-5cf66d9e/, '') || '/'

  if (path === '/' || path === '') return json({ ok: true, service: 'Tu Futuro Auto API', version: '2.0.0' })
  if (path === '/submit-publication' && req.method === 'POST') return handleSubmitPublication(req)
  if (path === '/submissions' && req.method === 'GET') return handleGetSubmissions()

  const submissionMatch = path.match(/^\/submissions\/([^/]+)$/)
  if (submissionMatch && req.method === 'GET') return handleGetSubmission(submissionMatch[1])

  const statusMatch = path.match(/^\/submissions\/([^/]+)\/status$/)
  if (statusMatch && req.method === 'PUT') return handleUpdateStatus(req, statusMatch[1])

  if (path === '/webhook/mercadopago' && req.method === 'POST') return handleMercadoPagoWebhook(req)

  return json({ success: false, message: 'Not found' }, 404)
})
