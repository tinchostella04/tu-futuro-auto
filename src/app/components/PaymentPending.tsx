import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Car, Mail, Phone } from 'lucide-react'
import { ROUTES } from '../routes'

export default function PaymentPending() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Clock className="w-10 h-10 text-yellow-600" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Publicación recibida!</h1>
        <p className="text-gray-600 mb-4">
          Tu publicación fue enviada exitosamente. El pago está pendiente de confirmación.
        </p>

        <div className="space-y-3 text-sm mb-6">
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-yellow-800">
            <strong>Próximos pasos:</strong>
            <ol className="text-left mt-2 space-y-1 list-decimal list-inside">
              <li>Confirmar el pago</li>
              <li>El equipo te contactará para coordinar</li>
              <li>Producción de fotos y video</li>
              <li>Publicación en catálogo y redes</li>
            </ol>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-3">¿Preguntas? Contactanos:</p>
          <div className="flex flex-col gap-2">
            <a href="mailto:info@tufuturoauto.com" className="flex items-center justify-center gap-2 text-teal-600 text-sm hover:underline">
              <Mail className="w-4 h-4" /> info@tufuturoauto.com
            </a>
            <a href="tel:+5493413215119" className="flex items-center justify-center gap-2 text-teal-600 text-sm hover:underline">
              <Phone className="w-4 h-4" /> +54 9 341 321 5119
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to={ROUTES.VEHICLES}
            className="flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
          >
            Ver catálogo de autos
          </Link>
          <Link
            to={ROUTES.HOME}
            className="flex items-center justify-center gap-2 text-gray-500 text-sm hover:text-gray-700"
          >
            <Car className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
