import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Car, Upload, X, Loader, ArrowLeft, Image, Video } from 'lucide-react'
import { API_BASE_URL } from '../../../utils/supabase/info'
import { ROUTES } from '../routes'

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
  precio: string
  kilometraje: string
  color: string
  transmision: string
  combustible: string
  puertas: string
  descripcion: string
  nombre: string
  email: string
  telefono: string
  provincia: string
  ciudad: string
}

export default function CreateVehicle() {
  const navigate = useNavigate()
  const [photos, setPhotos] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const handlePhotos = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    setPhotos(prev => [...prev, ...newFiles].slice(0, 20))
  }

  const handleVideo = (files: FileList | null) => {
    if (!files || !files[0]) return
    const f = files[0]
    if (!f.type.startsWith('video/')) return setError('Solo archivos de video.')
    if (f.size > 100 * 1024 * 1024) return setError('Video máx 100 MB.')
    setVideo(f)
    setError('')
  }

  const onSubmit = async (data: FormData) => {
    if (photos.length === 0) return setError('Subí al menos una foto.')
    setSubmitting(true)
    setError('')

    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)))
    fd.append('plan', 'manual')
    fd.append('paymentMethod', 'manual')
    fd.append('needsPhotoSession', 'false')
    photos.forEach((p, i) => fd.append(`photo_${i}`, p))
    if (video) fd.append('video', video)

    try {
      const res = await fetch(`${API_BASE_URL}/submit-publication`, {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Error')
      navigate(ROUTES.ADMIN)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear el vehículo.')
      setSubmitting(false)
    }
  }

  const InputField = ({
    name,
    label,
    placeholder,
    type = 'text',
  }: {
    name: keyof FormData
    label: string
    placeholder: string
    type?: string
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        {...register(name, { required: `${label} requerido` })}
        type={type}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]?.message}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to={ROUTES.ADMIN} className="text-gray-500 hover:text-teal-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Car className="w-6 h-6 text-teal-600" />
          <h1 className="text-lg font-semibold">Crear vehículo manual</h1>
          <span className="ml-2 bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">MANUAL</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Vehicle info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Información del vehículo</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <InputField name="marca" label="Marca" placeholder="Toyota" />
              <InputField name="modelo" label="Modelo" placeholder="Corolla" />
              <InputField name="año" label="Año" placeholder="2020" />
              <InputField name="precio" label="Precio (ARS)" placeholder="5000000" />
              <InputField name="kilometraje" label="Kilometraje" placeholder="50000" />
              <InputField name="color" label="Color" placeholder="Blanco" />

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Puertas</label>
                <select
                  {...register('puertas', { required: 'Requerido' })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="">Seleccioná</option>
                  {['2', '3', '4', '5'].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  {...register('descripcion', { required: 'Requerido' })}
                  rows={3}
                  placeholder="Describí el vehículo..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Datos del vendedor</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <InputField name="nombre" label="Nombre" placeholder="Juan García" />
              <InputField name="email" label="Email" placeholder="juan@email.com" type="email" />
              <InputField name="telefono" label="Teléfono" placeholder="+54 9 341 000 0000" />
              <InputField name="ciudad" label="Ciudad" placeholder="Rosario" />
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
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Fotos <span className="text-sm font-normal text-gray-500">(mín. 1, máx. 20)</span></h2>
            <input ref={photoInputRef} type="file" accept="image/*" multiple hidden onChange={e => handlePhotos(e.target.files)} />
            <button type="button" onClick={() => photoInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-teal-400 transition-colors">
              <Image className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500">Click para subir fotos</span>
            </button>
            {photos.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-4">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={URL.createObjectURL(p)} alt="" className="w-full h-full object-cover rounded-lg" />
                    <button type="button" onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Video <span className="text-sm font-normal text-gray-500">(opcional, máx. 100 MB)</span></h2>
            <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={e => handleVideo(e.target.files)} />
            {video ? (
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Video className="w-4 h-4 text-teal-600" /> {video.name}
                </div>
                <button type="button" onClick={() => setVideo(null)}>
                  <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => videoInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-teal-400 transition-colors">
                <Video className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">Click para subir video</span>
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader className="w-5 h-5 animate-spin" /> Creando...</> : <><Upload className="w-5 h-5" /> Crear vehículo</>}
          </button>
        </form>
      </main>
    </div>
  )
}
