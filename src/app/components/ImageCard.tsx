import { useState } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ImageCardProps {
  image: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

export function ImageCard({ image, title, subtitle, onClick, className = '' }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer ${className}`}
    >
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      <ImageWithFallback
        src={image}
        alt={title}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {!hasError && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      )}

      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <h3 className="text-white text-xl font-bold" style={{ fontFamily: 'Montserrat' }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-white/80 text-sm" style={{ fontFamily: 'Inter' }}>
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
