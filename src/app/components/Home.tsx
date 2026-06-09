import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Car,
  Camera,
  TrendingUp,
  Target,
  Check,
  Phone,
  Mail,
  Instagram,
  Facebook,
  ChevronDown,
  Star,
} from 'lucide-react'
import { ROUTES } from '../routes'

const PLANS = [
  {
    name: 'Básico',
    price: 'ARS 50.000',
    color: 'border-gray-200',
    badge: '',
    features: [
      '5 fotos profesionales',
      'Publicación en Marketplace',
      'Descripción destacada',
      '30 días de vigencia',
    ],
  },
  {
    name: 'Pro',
    price: 'ARS 90.000',
    color: 'border-teal-500',
    badge: 'Más popular',
    features: [
      'Todo del Básico',
      '10 fotos profesionales',
      'Video de 30 segundos',
      'Publicación en redes sociales',
      '3 boosts',
      '45 días de vigencia',
    ],
  },
  {
    name: 'Elite',
    price: 'ARS 150.000',
    color: 'border-yellow-400',
    badge: 'Premium',
    features: [
      'Todo del Pro',
      '15 fotos profesionales',
      'Video de 60 segundos',
      'Campaña en Meta Ads',
      'Publicación premium',
      '5 boosts',
      '60 días de vigencia',
    ],
  },
]

const STEPS = [
  {
    icon: <Camera className="w-8 h-8" />,
    title: 'Publicás tu auto',
    desc: 'Completás el formulario con los datos de tu vehículo y elegís el plan que más te conviene.',
  },
  {
    icon: <Star className="w-8 h-8" />,
    title: 'Nosotros lo producimos',
    desc: 'Sacamos fotos y videos profesionales, redactamos la descripción y creamos el contenido de marketing.',
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: 'Vendés más rápido',
    desc: 'Tu auto aparece en nuestro catálogo y en redes sociales con la mejor presentación posible.',
  },
]

export default function Home() {
  const [showCTA, setShowCTA] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowCTA(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <Car className="w-7 h-7 text-teal-600" />
            <span className="font-bold text-lg">
              tu<span className="text-teal-600">futuro</span>auto.
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#como-funciona" className="hover:text-teal-600 transition-colors">Cómo funciona</a>
            <a href="#planes" className="hover:text-teal-600 transition-colors">Planes</a>
            <Link to={ROUTES.VEHICLES} className="hover:text-teal-600 transition-colors">Catálogo</Link>
          </nav>
          <Link
            to={ROUTES.PUBLISH}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            Publicar mi auto
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-teal-50 via-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-teal-100 text-teal-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
              Marketing profesional para tu auto
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Vendé tu auto con{' '}
              <span className="text-teal-600">marketing profesional</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Fotos y videos profesionales, publicación en redes sociales y campaña publicitaria.
              Todo lo que necesitás para vender más rápido y al mejor precio.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={ROUTES.PUBLISH}
                className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors text-center"
              >
                Publicar mi auto ahora
              </Link>
              <Link
                to={ROUTES.VEHICLES}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-teal-600 hover:text-teal-600 transition-colors text-center"
              >
                Ver catálogo
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex justify-center"
          >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl h-48 flex items-center justify-center mb-4">
                <Car className="w-24 h-24 text-white/80" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                <div className="flex gap-2 mt-3">
                  <div className="h-8 bg-teal-100 rounded-lg flex-1" />
                  <div className="h-8 bg-gray-100 rounded-lg flex-1" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cómo funciona</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              En 3 simples pasos, tu auto tiene la presentación que se merece
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="text-sm font-medium text-teal-600 mb-2">Paso {i + 1}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Elegí tu plan</h2>
            <p className="text-gray-600">
              Precios accesibles para cada necesidad
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white rounded-2xl p-6 border-2 ${plan.color} ${i === 1 ? 'shadow-xl scale-105' : 'shadow-md'} relative`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="text-2xl font-bold text-teal-600 mb-4">{plan.price}</div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={ROUTES.PUBLISH}
                  className={`block text-center py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
                    i === 1
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'border border-teal-600 text-teal-600 hover:bg-teal-50'
                  }`}
                >
                  Elegir {plan.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-6 h-6 text-teal-400" />
                <span className="font-bold text-white">
                  tu<span className="text-teal-400">futuro</span>auto.
                </span>
              </div>
              <p className="text-sm">
                Marketing profesional para la venta de vehículos en Argentina.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Contacto</h4>
              <div className="space-y-2 text-sm">
                <a href="mailto:info@tufuturoauto.com" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
                  <Mail className="w-4 h-4" /> info@tufuturoauto.com
                </a>
                <a href="tel:+5493413215119" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
                  <Phone className="w-4 h-4" /> +54 9 341 321 5119
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Redes sociales</h4>
              <div className="flex gap-3">
                <a href="https://instagram.com/tufuturoauto" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://facebook.com/tufuturoauto" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm">
            <p>© {new Date().getFullYear()} Tu Futuro Auto. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Sticky CTA */}
      {showCTA && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 md:hidden"
        >
          <Link
            to={ROUTES.PUBLISH}
            className="block w-full bg-teal-600 text-white text-center py-3 rounded-xl font-semibold"
          >
            Publicar mi auto
          </Link>
        </motion.div>
      )}
    </div>
  )
}
