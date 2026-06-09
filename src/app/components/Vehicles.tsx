import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Car,
  MapPin,
  Gauge,
  Fuel,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  ArrowLeft,
  Play,
} from 'lucide-react'
import { API_BASE_URL } from '../../../utils/supabase/info'
import { ROUTES } from '../routes'
import ImageWithFallback from './figma/ImageWithFallback'

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
  }
  photos: Array<{ url: string; name: string }>
  video: { url: string; name: string } | null
}

function formatPrice(price: string) {
  const num = Number(price.replace(/\D/g, ''))
  return isNaN(num) ? price : `$${num.toLocaleString('es-AR')}`
}

function formatKm(km: string) {
  const num = Number(km.replace(/\D/g, ''))
  return isNaN(num) ? km : `${num.toLocaleString('es-AR')} km`
}

function VehicleModal({
  vehicle,
  onClose,
}: {
  vehicle: Submission
  onClose: () => void
}) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const photos = vehicle.photos || []

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setPhotoIndex(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setPhotoIndex(i => Math.min(photos.length - 1, i + 1))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [photos.length, onClose])

  const { formData } = vehicle

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Gallery */}
        <div className="relative bg-gray-900 rounded-t-2xl overflow-hidden h-72 md:h-96">
          {photos.length > 0 ? (
            <img
              src={photos[photoIndex]?.url}
              alt={`${formData.marca} ${formData.modelo}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="w-24 h-24 text-gray-600" />
            </div>
          )}

          {/* Nav */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIndex(i => Math.max(0, i - 1))}
                disabled={photoIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPhotoIndex(i => Math.min(photos.length - 1, i + 1))}
                disabled={photoIndex === photos.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center text-white disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {photoIndex + 1}/{photos.length}
              </div>
            </>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {formData.marca} {formData.modelo}
              </h2>
              <p className="text-gray-500">{formData.año} · {formData.color}</p>
            </div>
            <div className="text-2xl font-bold text-teal-600">
              {formatPrice(formData.precio)}
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { icon: <Gauge className="w-4 h-4" />, label: 'Kilómetros', val: formatKm(formData.kilometraje) },
              { icon: <Settings className="w-4 h-4" />, label: 'Transmisión', val: formData.transmision },
              { icon: <Fuel className="w-4 h-4" />, label: 'Combustible', val: formData.combustible },
              { icon: <Car className="w-4 h-4" />, label: 'Puertas', val: `${formData.puertas} puertas` },
            ].map((spec, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                  {spec.icon} {spec.label}
                </div>
                <div className="font-semibold text-gray-800 text-sm capitalize">{spec.val}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {formData.descripcion && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{formData.descripcion}</p>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
            <MapPin className="w-4 h-4" />
            {formData.ciudad}, {formData.provincia}
          </div>

          {/* Video */}
          {vehicle.video && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Video</h3>
              <a
                href={vehicle.video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm"
              >
                <Play className="w-4 h-4" /> Ver video del vehículo
              </a>
            </div>
          )}

          {/* Contact */}
          <div className="bg-teal-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Contactar al vendedor</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`tel:${formData.telefono}`}
                className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-teal-700 transition-colors"
              >
                <Phone className="w-4 h-4" /> {formData.telefono}
              </a>
              <a
                href={`mailto:${formData.email}`}
                className="flex items-center justify-center gap-2 border border-teal-600 text-teal-600 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-teal-50 transition-colors"
              >
                <Mail className="w-4 h-4" /> Enviar email
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Submission | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/submissions`)
      .then(r => r.json())
      .then(data => {
        const published = (data.submissions || []).filter(
          (s: Submission) => s.status === 'published'
        )
        setVehicles(published)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to={ROUTES.HOME} className="text-gray-500 hover:text-teal-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-teal-600" />
            <span className="font-bold">tu<span className="text-teal-600">futuro</span>auto.</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 ml-2">Catálogo de vehículos</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No hay vehículos disponibles
            </h2>
            <p className="text-gray-500 mb-6">
              Aún no tenemos vehículos publicados. ¡Publicá el tuyo!
            </p>
            <Link
              to={ROUTES.PUBLISH}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
            >
              Publicar mi auto
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">
              {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} disponible{vehicles.length !== 1 ? 's' : ''}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(v => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer"
                  onClick={() => setSelected(v)}
                >
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {v.photos.length > 0 ? (
                      <ImageWithFallback
                        src={v.photos[0].url}
                        alt={`${v.formData.marca} ${v.formData.modelo}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {v.photos.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                        +{v.photos.length - 1} fotos
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {v.formData.marca} {v.formData.modelo}
                    </h3>
                    <p className="text-gray-500 text-sm mb-2">{v.formData.año} · {v.formData.color}</p>
                    <p className="text-teal-600 font-bold text-xl mb-3">
                      {formatPrice(v.formData.precio)}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                        <Gauge className="w-3 h-3" /> {formatKm(v.formData.kilometraje)}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full capitalize">
                        <Settings className="w-3 h-3" /> {v.formData.transmision}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full capitalize">
                        <Fuel className="w-3 h-3" /> {v.formData.combustible}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-2">
                      <MapPin className="w-3 h-3" />
                      {v.formData.ciudad}, {v.formData.provincia}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <VehicleModal vehicle={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
