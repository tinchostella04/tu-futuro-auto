import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Car, ArrowRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import { ROUTES } from '../routes'

export default function PaymentSuccess() {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#0d9488', '#14b8a6', '#ffffff', '#f0fdf4'],
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago exitoso!</h1>
        <p className="text-gray-600 mb-6">
          Tu publicación fue recibida y está siendo procesada. En breve el equipo de{' '}
          <span className="font-semibold text-teal-600">Tu Futuro Auto</span> se pondrá en contacto para coordinar la sesión de fotos.
        </p>

        <div className="bg-teal-50 rounded-2xl p-4 mb-6 text-sm text-teal-800">
          <p>¿Dudas? Escribinos a <strong>info@tufuturoauto.com</strong></p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to={ROUTES.VEHICLES}
            className="flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
          >
            Ver catálogo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to={ROUTES.HOME}
            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:border-teal-500 hover:text-teal-600 transition-colors"
          >
            <Car className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
