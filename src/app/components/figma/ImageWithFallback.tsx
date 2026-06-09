import { useState } from 'react'
import { Car } from 'lucide-react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fallbackClassName?: string
}

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackClassName = '',
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${fallbackClassName || className}`}
      >
        <Car className="w-12 h-12 opacity-30" />
      </div>
    )
  }

  return (
    <>
      {loading && (
        <div
          className={`absolute inset-0 bg-gray-100 animate-pulse ${className}`}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
      />
    </>
  )
}
