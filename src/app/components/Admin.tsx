import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Car,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  ExternalLink,
  Image,
  Play,
  Phone,
  Mail,
  MapPin,
  Gauge,
  Fuel,
  Settings,
  Calendar,
} from 'lucide-react'
import { API_BASE_URL } from '../../../utils/supabase/info'
import { ROUTES } from '../routes'

interface Submission {
  id: string
  timestamp: string
  status: string
  formData: {
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
    plan: string
    paymentMethod: string
  }
  photos: Array<{ url: string; name: string }>
  video: { url: string; name: string } | null
  paymentStatus?: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  published: { label: 'Publicado', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  unpublished: { label: 'Despublicado', color: 'bg-gray-100 text-gray-600' },
  paid: { label: 'Pagado', color: 'bg-blue-100 text-blue-700' },
  payment_failed: { label: 'Pago fallido', color: 'bg-red-100 text-red-700' },
  payment_pending: { label: 'Pago pendiente', color: 'bg-orange-100 text-orange-700' },
}

const PLAN_COLORS: Record<string, string> = {
  basico: 'bg-gray-100 text-gray-700',
  pro: 'bg-teal-100 text-teal-700',
  elite: 'bg-yellow-100 text-yellow-700',
  manual: 'bg-orange-100 text-orange-700',
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrice(price: string) {
  const num = Number(price.replace(/\D/g, ''))
  return isNaN(num) ? price : `$${num.toLocaleString('es-AR')}`
}

export default function Admin() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('todos')
  const [expandedPhotos, setExpandedPhotos] = useState<Set<string>>(new Set())
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/submissions`)
      const data = await res.json()
      setSubmissions(data.submissions || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      await fetch(`${API_BASE_URL}/submissions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setSubmissions(prev =>
        prev.map(s => s.id === id ? { ...s, status } : s)
      )
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = submissions.filter(s => {
    if (filter === 'todos') return true
    if (filter === 'publicados') return s.status === 'published'
    if (filter === 'pendientes') return ['pending', 'paid', 'payment_pending'].includes(s.status)
    if (filter === 'despublicados') return s.status === 'unpublished'
    return true
  })

  const stats = {
    total: submissions.length,
    published: submissions.filter(s => s.status === 'published').length,
    pending: submissions.filter(s => ['pending', 'paid', 'payment_pending'].includes(s.status)).length,
    unpublished: submissions.filter(s => s.status === 'unpublished').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Car className="w-6 h-6 text-teal-600" />
            <span className="font-bold">tu<span className="text-teal-600">futuro</span>auto.</span>
            <span className="text-gray-400">|</span>
            <h1 className="font-semibold text-gray-800">Panel de Administración</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.CREATE_VEHICLE}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Crear vehículo
            </Link>
            <button
              onClick={fetchSubmissions}
              disabled={loading}
              className="flex items-center gap-2 border border-gray-300 text-gray-600 px-3 py-2 rounded-xl text-sm hover:border-teal-500 hover:text-teal-600 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900' },
            { label: 'Publicados', value: stats.published, color: 'text-green-600' },
            { label: 'Pendientes', value: stats.pending, color: 'text-yellow-600' },
            { label: 'Despublicados', value: stats.unpublished, color: 'text-gray-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'publicados', label: 'Publicados' },
            { id: 'pendientes', label: 'Pendientes' },
            { id: 'despublicados', label: 'Despublicados' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Info banner */}
        {stats.published === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
            No hay vehículos publicados aún. Publicá uno para que aparezca en el catálogo.
          </div>
        )}

        {/* Submissions list */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse h-32" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay publicaciones en esta categoría.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(sub => {
              const showPhotos = expandedPhotos.has(sub.id)
              const statusInfo = STATUS_LABELS[sub.status] || { label: sub.status, color: 'bg-gray-100 text-gray-600' }

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {sub.formData.marca} {sub.formData.modelo} {sub.formData.año}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(sub.timestamp)}
                          <span className="text-gray-200">|</span>
                          <span className="text-xs text-gray-400 font-mono">{sub.id}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${PLAN_COLORS[sub.formData.plan] || 'bg-gray-100 text-gray-600'}`}>
                          {sub.formData.plan?.toUpperCase()}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Vehicle info */}
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                      <span className="font-bold text-teal-600 text-lg">{formatPrice(sub.formData.precio)}</span>
                      <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> {sub.formData.kilometraje} km</span>
                      <span className="flex items-center gap-1 capitalize"><Settings className="w-3.5 h-3.5" /> {sub.formData.transmision}</span>
                      <span className="flex items-center gap-1 capitalize"><Fuel className="w-3.5 h-3.5" /> {sub.formData.combustible}</span>
                      <span>{sub.formData.color}</span>
                    </div>

                    {/* Contact */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      <span className="font-medium text-gray-800">{sub.formData.nombre}</span>
                      <a href={`mailto:${sub.formData.email}`} className="flex items-center gap-1 hover:text-teal-600">
                        <Mail className="w-3.5 h-3.5" /> {sub.formData.email}
                      </a>
                      <a href={`tel:${sub.formData.telefono}`} className="flex items-center gap-1 hover:text-teal-600">
                        <Phone className="w-3.5 h-3.5" /> {sub.formData.telefono}
                      </a>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {sub.formData.ciudad}, {sub.formData.provincia}
                      </span>
                    </div>

                    {/* Media info */}
                    <div className="flex gap-2 mb-4 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <Image className="w-3 h-3" /> {sub.photos.length} foto{sub.photos.length !== 1 ? 's' : ''}
                      </span>
                      {sub.video && (
                        <span className="bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                          <Play className="w-3 h-3" /> Video
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {sub.status !== 'published' && (
                        <button
                          onClick={() => updateStatus(sub.id, 'published')}
                          disabled={updatingId === sub.id}
                          className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
                        >
                          <Eye className="w-4 h-4" />
                          {updatingId === sub.id ? 'Publicando...' : 'Publicar vehículo'}
                        </button>
                      )}
                      {sub.status === 'published' && (
                        <button
                          onClick={() => updateStatus(sub.id, 'unpublished')}
                          disabled={updatingId === sub.id}
                          className="flex items-center gap-1.5 bg-gray-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-60"
                        >
                          <EyeOff className="w-4 h-4" />
                          {updatingId === sub.id ? 'Despublicando...' : 'Despublicar'}
                        </button>
                      )}
                      <Link
                        to={ROUTES.VEHICLES}
                        target="_blank"
                        className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-2 rounded-xl text-sm hover:border-teal-500 hover:text-teal-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" /> Ver catálogo
                      </Link>
                      {sub.photos.length > 0 && (
                        <button
                          onClick={() => setExpandedPhotos(prev => {
                            const next = new Set(prev)
                            next.has(sub.id) ? next.delete(sub.id) : next.add(sub.id)
                            return next
                          })}
                          className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-2 rounded-xl text-sm hover:border-teal-500 hover:text-teal-600 transition-colors"
                        >
                          <Image className="w-4 h-4" /> {showPhotos ? 'Ocultar' : 'Ver'} fotos
                        </button>
                      )}
                      {sub.video && (
                        <a
                          href={sub.video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-2 rounded-xl text-sm hover:border-teal-500 hover:text-teal-600 transition-colors"
                        >
                          <Play className="w-4 h-4" /> Ver video
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Photos gallery */}
                  {showPhotos && sub.photos.length > 0 && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {sub.photos.map((photo, i) => (
                          <div key={i} className="relative group aspect-square">
                            <img
                              src={photo.url}
                              alt={`Foto ${i + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <a
                              href={photo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <ExternalLink className="w-5 h-5 text-white" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
