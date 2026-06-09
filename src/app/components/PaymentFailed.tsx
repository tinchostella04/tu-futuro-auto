import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { XCircle, Car, RefreshCw, Mail } from 'lucide-react'
import { ROUTES } from '../routes'

export default function PaymentFailed() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-10 h-10 text-red-600" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago no procesado</h1>
        <p className="text-gray-600 mb-6">
          Hubo un problema al procesar tu pago. Podés intentarlo nuevamente o contactarnos para coordinar otro método de pago.
        </p>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 text-sm text-red-800">
          <p>Si el problema persiste, escribinos a <strong>info@tufuturoauto.com</strong> o llamanos al <strong>+54 9 341 321 5119</strong></p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to={ROUTES.PUBLISH}
            className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar publicación
          </Link>
          <a
            href="mailto:info@tufuturoauto.com"
            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:border-red-400 hover:text-red-600 transition-colors"
          >
            <Mail className="w-4 h-4" /> Contactar soporte
          </a>
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
