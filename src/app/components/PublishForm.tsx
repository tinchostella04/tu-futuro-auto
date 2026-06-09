import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import {
  Car,
  Upload,
  X,
  Loader,
  Check,
  ArrowLeft,
  Camera,
  Image,
  Video,
} from 'lucide-react'
import { API_BASE_URL } from '../../../utils/supabase/info'
import { ROUTES } from '../routes'

const PLANS = [
  { id: 'basico', name: 'Básico', price: 50000, maxPhotos: 5, video: false },
  { id: 'pro', name: 'Pro', price: 90000, maxPhotos: 10, video: true },
  { id: 'elite', name: 'Elite', price: 150000, maxPhotos: 15, video: true },
]

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
  'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

interface FormData {
  marca: string
  modelo: string
  año: string
  kilometraje: string
  precio: string
  transmision: string
  combustible: string
  color: string
  puertas: string
  descripcion: string
  nombre: string
  email: string
  telefono: string
  provincia: string
  ciudad: string
  needsPhotoSession: boolean
  paymentMethod: string
}

export default function PublishForm() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const plan = PLANS.find(p => p.id === selectedPlan)

  const handlePhotos = (files: FileList | null) => {
    if (!files) return
    const max = plan?.maxPhotos || 5
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    setPhotos(prev => [...prev, ...newFiles].slice(0, max))
  }

  const handleVideo = (files: FileList | null) => {
    if (!files || !files[0]) return
    const f = files[0]
    if (!f.type.startsWith('video/')) return setError('Solo se permiten archivos de video.')
    if (f.size > 100 * 1024 * 1024) return setError('El video no puede superar 100 MB.')
    setVideo(f)
    setError('')
  }

  const onSubmit = async (data: FormData) => {
    if (!selectedPlan) return setError('Seleccioná un plan para continuar.')
    if (photos.length === 0) return setError('Subí al menos una foto del vehículo.')
    setSubmitting(true)
    setError('')

    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)))
    fd.append('plan', selectedPlan)
    photos.forEach((p, i) => fd.append(`photo_${i}`, p))
    if (video) fd.append('video', video)

    try {
      const res = await fetch(`${API_BASE_URL}/submit-publication`, {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Error al enviar')

      if (json.data?.paymentLink) {
        window.location.href = json.data.paymentLink
      } else {
        navigate(ROUTES.PAYMENT_PENDING)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al enviar la publicación. Intentá de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to={ROUTES.HOME} className="text-gray-500 hover:text-teal-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-teal-600" />
            <span className="font-bold">tu<span className="text-teal-600">futuro</span>auto.</span>
          </div>
          <h1 className="text-lg font-semibold">Publicar mi auto</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Step 1: Plan */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
              Elegí tu plan
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {PLANS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlan(p.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPlan === p.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-200'
                  }`}
                >
                  <div className="font-bold text-gray-900">{p.name}</div>
                  <div className="text-teal-600 font-semibold">${p.price.toLocaleString('es-AR')}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {p.maxPhotos} fotos · {p.video ? 'con video' : 'sin video'}
                  </div>
                  {selectedPlan === p.id && (
                    <Check className="w-4 h-4 text-teal-600 mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Vehicle data */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
              Datos del vehículo
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'marca', label: 'Marca', placeholder: 'Toyota, Ford, etc.' },
                { name: 'modelo', label: 'Modelo', placeholder: 'Corolla, Focus, etc.' },
                { name: 'año', label: 'Año', placeholder: '2020' },
                { name: 'kilometraje', label: 'Kilometraje', placeholder: '50000' },
                { name: 'precio', label: 'Precio (ARS)', placeholder: '5000000' },
                { name: 'color', label: 'Color', placeholder: 'Blanco' },
                { name: 'puertas', label: 'Puertas', placeholder: '4' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    {...register(f.name as keyof FormData, { required: `${f.label} es requerido` })}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                  />
                  {errors[f.name as keyof FormData] && (
                    <p className="text-red-500 text-xs mt-1">{errors[f.name as keyof FormData]?.message}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transmisión</label>
                <select
                  {...register('transmision', { required: 'Requerido' })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="">Seleccioná</option>
                  <option value="manual">Manual</option>
                  <option value="automatica">Automática</option>
                  <option value="secuencial">Secuencial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Combustible</label>
                <select
                  {...register('combustible', { required: 'Requerido' })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="">Seleccioná</option>
                  <option value="nafta">Nafta</option>
                  <option value="diesel">Diesel</option>
                  <option value="gnc">GNC</option>
                  <option value="electrico">Eléctrico</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  {...register('descripcion', { required: 'Descripción requerida' })}
                  rows={3}
                  placeholder="Describí tu vehículo, estado, extras, etc."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Photos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
              Fotos {plan && <span className="text-sm font-normal text-gray-500">(máx. {plan.maxPhotos})</span>}
            </h2>
            <input ref={photoInputRef} type="file" accept="image/*" multiple hidden onChange={e => handlePhotos(e.target.files)} />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-teal-400 transition-colors"
            >
              <Image className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500">Click para subir fotos</span>
              <span className="text-xs text-gray-400">JPG, PNG, WEBP</span>
            </button>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-4">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={URL.createObjectURL(p)} alt="" className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 4: Video (if plan allows) */}
          {plan?.video && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
                Video <span className="text-sm font-normal text-gray-500">(opcional, máx. 100 MB)</span>
              </h2>
              <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={e => handleVideo(e.target.files)} />
              {video ? (
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Video className="w-4 h-4 text-teal-600" />
                    {video.name}
                  </div>
                  <button type="button" onClick={() => setVideo(null)}>
                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-teal-400 transition-colors"
                >
                  <Video className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Click para subir video</span>
                </button>
              )}
            </div>
          )}

          {/* Step 5: Personal data */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm">{plan?.video ? '5' : '4'}</span>
              Tus datos de contacto
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'nombre', label: 'Nombre completo', placeholder: 'Juan García' },
                { name: 'email', label: 'Email', placeholder: 'juan@email.com', type: 'email' },
                { name: 'telefono', label: 'Teléfono', placeholder: '+54 9 341 000 0000' },
                { name: 'ciudad', label: 'Ciudad', placeholder: 'Rosario' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    {...register(f.name as keyof FormData, { required: `${f.label} es requerido` })}
                    type={f.type || 'text'}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                  />
                  {errors[f.name as keyof FormData] && (
                    <p className="text-red-500 text-xs mt-1">{errors[f.name as keyof FormData]?.message}</p>
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                <select
                  {...register('provincia', { required: 'Requerido' })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="">Seleccioná</option>
                  {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Photo session */}
            <div className="mt-4 flex items-center gap-3">
              <input
                {...register('needsPhotoSession')}
                type="checkbox"
                id="photoSession"
                className="w-4 h-4 accent-teal-600"
              />
              <label htmlFor="photoSession" className="text-sm text-gray-700 flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-600" />
                Necesito sesión de fotos profesional
              </label>
            </div>
          </div>

          {/* Step 6: Payment */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm">{plan?.video ? '6' : '5'}</span>
              Método de pago
            </h2>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { id: 'mercadopago', label: 'Mercado Pago', desc: 'Pago online seguro' },
                { id: 'transferencia', label: 'Transferencia', desc: 'CBU / CVU / Alias' },
                { id: 'efectivo', label: 'Efectivo', desc: 'Pago en persona' },
              ].map(pm => (
                <label key={pm.id} className="relative flex flex-col gap-1 border-2 border-gray-200 rounded-xl p-4 cursor-pointer has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50 transition-all">
                  <input
                    {...register('paymentMethod', { required: 'Seleccioná un método de pago' })}
                    type="radio"
                    value={pm.id}
                    className="absolute opacity-0"
                  />
                  <span className="font-medium text-gray-900 text-sm">{pm.label}</span>
                  <span className="text-xs text-gray-500">{pm.desc}</span>
                </label>
              ))}
            </div>
            {errors.paymentMethod && (
              <p className="text-red-500 text-xs mt-2">{errors.paymentMethod.message}</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" /> Enviando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" /> Publicar mi auto
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
