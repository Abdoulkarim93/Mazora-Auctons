
import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src?: string | null;
    alt: string;
    className?: string;
    fallbackText?: string;
}

// Minimalistic SVG placeholder
const FALLBACK_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 600'%3E%3Crect fill='%23F3F4F6' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%239CA3AF'%3EImage%3C/text%3E%3C/svg%3E`;

export const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, fallbackText, ...props }) => {
    const [currentSrc, setCurrentSrc] = useState<string>(FALLBACK_IMAGE);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        // 1. If no source, stay on fallback
        if (!src) {
            setCurrentSrc(FALLBACK_IMAGE);
            return;
        }

        // 2. Reset state for new image
        setIsLoaded(false);
        setHasError(false);

        // 3. Pre-load image off-screen to prevent "scanline" effect on mobile
        const img = new Image();
        img.src = src;
        img.decoding = 'async'; // Critical for mobile main thread performance

        img.onload = () => {
            // Apply a small timeout to avoid micro-stuttering during state updates
            requestAnimationFrame(() => {
                setCurrentSrc(src);
                setIsLoaded(true);
            });
        };

        img.onerror = () => {
            setHasError(true);
            setCurrentSrc(FALLBACK_IMAGE);
        };

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src]);

    return (
        <div 
            className={`relative overflow-hidden bg-gray-100 ${className?.includes('rounded') ? '' : 'rounded-none'} ${className || ''}`} 
            style={{ 
                transform: 'translateZ(0)', // Force GPU acceleration
                contain: 'content', // CSS containment for layout performance
            }}
        >
            {/* Smooth Fade Transition */}
            <img
                ref={imgRef}
                src={currentSrc}
                alt={alt}
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover transition-opacity duration-300 ease-in will-change-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                {...props}
            />

            {/* Skeleton / Loading State underneath */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse z-0 flex items-center justify-center">
                    <div className="w-full h-full opacity-10 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1s_infinite]"></div>
                </div>
            )}
            
            {/* Error State */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 z-10">
                    {fallbackText ? (
                        <span className="text-[10px] text-center p-2 font-medium">{fallbackText}</span>
                    ) : (
                        <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    )}
                </div>
            )}
            
            <style>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    );
};
