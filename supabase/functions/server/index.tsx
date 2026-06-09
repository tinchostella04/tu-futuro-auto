import { Hono } from 'https://deno.land/x/hono@v4.3.11/mod.ts'
import { cors } from 'https://deno.land/x/hono@v4.3.11/middleware.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createPaymentLink, verifyWebhookPayment } from './mercadopago.tsx'

const app = new Hono()

// CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Supabase client
function getSupabase() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )
}

const TABLE = 'kv_store_5cf66d9e'
const BUCKET = 'make-5cf66d9e-photos'

// ─── Helper: get all submissions ───────────────────────────────────────────────
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

// ─── Helper: sign photo URLs ───────────────────────────────────────────────────
async function signPhotoUrls(
  supabase: ReturnType<typeof getSupabase>,
  submission: Record<string, unknown>
) {
  const photos = (submission.photos as Array<{ path: string; url?: string; name: string; size: number; type: string; index: number }>) || []
  const video = submission.video as { path: string; url?: string; name: string; size: number; type: string } | null

  const signedPhotos = await Promise.all(
    photos.map(async (photo) => {
      if (!photo.path) return photo
      const { data } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(photo.path, 60 * 60 * 24 * 365) // 1 year
      return { ...photo, url: data?.signedUrl || photo.url || '' }
    })
  )

  let signedVideo = video
  if (video?.path) {
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(video.path, 60 * 60 * 24 * 365)
    signedVideo = { ...video, url: data?.signedUrl || video.url || '' }
  }

  return { ...submission, photos: signedPhotos, video: signedVideo }
}

// ─── POST /submit-publication ──────────────────────────────────────────────────
app.post('/submit-publication', async (c) => {
  try {
    const supabase = getSupabase()
    const formData = await c.req.formData()

    const submissionId = `submission_${Date.now()}`

    // Extract form fields
    const fields: Record<string, string> = {}
    const photoFiles: File[] = []
    let videoFile: File | null = null

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('photo_') && value instanceof File) {
        photoFiles.push(value)
      } else if (key === 'video' && value instanceof File) {
        videoFile = value
      } else if (typeof value === 'string') {
        fields[key] = value
      }
    }

    // Upload photos
    const uploadedPhotos: Array<{
      name: string
      size: number
      type: string
      index: number
      path: string
      url: string
    }> = []

    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i]
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${submissionId}/photo_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const buffer = await file.arrayBuffer()

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: file.type })

      if (!error) {
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(path, 60 * 60 * 24 * 365)

        uploadedPhotos.push({
          name: file.name,
          size: file.size,
          type: file.type,
          index: i,
          path,
          url: signed?.signedUrl || '',
        })
      }
    }

    // Upload video
    let uploadedVideo: { name: string; size: number; type: string; path: string; url: string } | null = null
    if (videoFile) {
      const path = `${submissionId}/video_${videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const buffer = await videoFile.arrayBuffer()
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: videoFile.type })

      if (!error) {
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(path, 60 * 60 * 24 * 365)

        uploadedVideo = {
          name: videoFile.name,
          size: videoFile.size,
          type: videoFile.type,
          path,
          url: signed?.signedUrl || '',
        }
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

    // Save to DB
    const { error: dbError } = await supabase
      .from(TABLE)
      .insert({ key: submissionId, value: submission })

    if (dbError) throw dbError

    // Create payment link if needed
    let paymentLink: string | null = null
    if (fields.paymentMethod === 'mercadopago' && fields.plan !== 'manual') {
      paymentLink = await createPaymentLink({
        plan: fields.plan,
        marca: fields.marca,
        modelo: fields.modelo,
        año: fields.año,
        email: fields.email,
        submissionId,
      })
    }

    return c.json({
      success: true,
      message: 'Publicación recibida exitosamente',
      data: {
        submissionId,
        summary: {
          marca: fields.marca,
          modelo: fields.modelo,
          plan: fields.plan,
          photos: uploadedPhotos.length,
        },
        paymentLink,
        paymentMethod: fields.paymentMethod,
        note: paymentLink
          ? 'Redirigí al usuario al link de pago'
          : 'La publicación fue recibida. El pago se coordinará por otro medio.',
      },
    })
  } catch (error) {
    console.error('Error in submit-publication:', error)
    return c.json({ success: false, message: 'Error interno del servidor' }, 500)
  }
})

// ─── GET /submissions ──────────────────────────────────────────────────────────
app.get('/submissions', async (c) => {
  try {
    const supabase = getSupabase()
    const rawSubmissions = await getAllSubmissions(supabase)
    const submissions = await Promise.all(
      rawSubmissions.map(s => signPhotoUrls(supabase, s as Record<string, unknown>))
    )

    return c.json({ success: true, count: submissions.length, submissions })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return c.json({ success: false, message: 'Error al obtener publicaciones' }, 500)
  }
})

// ─── GET /submissions/:id ─────────────────────────────────────────────────────
app.get('/submissions/:id', async (c) => {
  try {
    const supabase = getSupabase()
    const id = c.req.param('id')

    const { data, error } = await supabase
      .from(TABLE)
      .select('key, value, created_at')
      .eq('key', id)
      .single()

    if (error || !data) {
      return c.json({ success: false, message: 'Publicación no encontrada' }, 404)
    }

    const submission = await signPhotoUrls(supabase, {
      id: data.key,
      ...(data.value as Record<string, unknown>),
      timestamp: (data.value as Record<string, unknown>).timestamp || data.created_at,
    })

    return c.json({ success: true, submission })
  } catch (error) {
    console.error('Error fetching submission:', error)
    return c.json({ success: false, message: 'Error al obtener la publicación' }, 500)
  }
})

// ─── PUT /submissions/:id/status ──────────────────────────────────────────────
app.put('/submissions/:id/status', async (c) => {
  try {
    const supabase = getSupabase()
    const id = c.req.param('id')
    const { status } = await c.req.json()

    if (!['published', 'unpublished', 'pending'].includes(status)) {
      return c.json({ success: false, message: 'Estado inválido' }, 400)
    }

    // Get current
    const { data, error } = await supabase
      .from(TABLE)
      .select('value')
      .eq('key', id)
      .single()

    if (error || !data) {
      return c.json({ success: false, message: 'Publicación no encontrada' }, 404)
    }

    const updated = {
      ...(data.value as Record<string, unknown>),
      status,
      statusUpdatedAt: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from(TABLE)
      .update({ value: updated })
      .eq('key', id)

    if (updateError) throw updateError

    return c.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      submission: { id, ...updated },
    })
  } catch (error) {
    console.error('Error updating status:', error)
    return c.json({ success: false, message: 'Error al actualizar el estado' }, 500)
  }
})

// ─── POST /webhook/mercadopago ────────────────────────────────────────────────
app.post('/webhook/mercadopago', async (c) => {
  try {
    const supabase = getSupabase()
    const body = await c.req.json()

    if (body.type !== 'payment') {
      return c.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return c.json({ received: true })

    const payment = await verifyWebhookPayment(String(paymentId))
    if (!payment) return c.json({ received: true })

    const submissionId = payment.external_reference
    if (!submissionId) return c.json({ received: true })

    // Map MP status to our status
    const statusMap: Record<string, string> = {
      approved: 'paid',
      rejected: 'payment_failed',
      pending: 'payment_pending',
      in_process: 'payment_pending',
    }

    const newStatus = statusMap[payment.status] || 'payment_pending'

    // Get and update
    const { data } = await supabase.from(TABLE).select('value').eq('key', submissionId).single()
    if (!data) return c.json({ received: true })

    const updated = {
      ...(data.value as Record<string, unknown>),
      status: newStatus,
      paymentStatus: payment.status,
      paymentId: String(paymentId),
      paymentDate: new Date().toISOString(),
    }

    await supabase.from(TABLE).update({ value: updated }).eq('key', submissionId)

    return c.json({ received: true, status: newStatus })
  } catch (error) {
    console.error('Webhook error:', error)
    return c.json({ received: true })
  }
})

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/', (c) => c.json({ ok: true, service: 'Tu Futuro Auto API', version: '1.0.0' }))

Deno.serve(app.fetch)
