import React, { useState, useEffect } from 'react'

// Default fallback images by category
const FALLBACK_IMAGES = {
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80'
  ],
  hero: [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80'
  ]
};

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement> & { fallbackType?: 'hotel' | 'hero' }) {
  const [didError, setDidError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(props.src)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setCurrentSrc(props.src)
    setDidError(false)
    setRetryCount(0)
  }, [props.src])

  const handleError = () => {
    console.error('❌ Image failed to load:', currentSrc, 'alt:', props.alt)
    
    // Try fallback images based on type
    const fallbackType = props.fallbackType || 'hotel'
    const fallbacks = FALLBACK_IMAGES[fallbackType]
    
    if (retryCount < fallbacks.length) {
      const newSrc = fallbacks[retryCount]
      console.log('🔄 Trying fallback image:', newSrc)
      setCurrentSrc(newSrc)
      setRetryCount(prev => prev + 1)
    } else {
      setDidError(true)
    }
  }

  const { src, alt, style, className, fallbackType, ...rest } = props

  return didError ? (
    <div
      className={`inline-block bg-gray-200 text-center align-middle flex items-center justify-center ${className ?? ''}`}
      style={style}
    >
      <div className="flex flex-col items-center justify-center text-gray-400">
        <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs">Image unavailable</span>
      </div>
    </div>
  ) : (
    <img 
      src={currentSrc} 
      alt={alt} 
      className={className} 
      style={style} 
      {...rest} 
      onError={handleError}
      crossOrigin="anonymous"
    />
  )
}
