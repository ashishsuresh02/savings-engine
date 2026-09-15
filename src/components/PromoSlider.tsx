'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink } from 'lucide-react';

export interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  image_url: string;
  link_url: string;
  badge?: string;
}

interface PromoSliderProps {
  slides: BannerSlide[];
  autoSlideInterval?: number;
  heightClass?: string;
  variant?: 'hero' | 'mini';
}

export default function PromoSlider({
  slides,
  autoSlideInterval = 4500,
  heightClass = 'h-52 sm:h-72 md:h-80',
  variant = 'hero',
}: PromoSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play interval with pause on hover
  useEffect(() => {
    if (isHovered || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [current, isHovered, slides.length, autoSlideInterval]);

  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);

  if (!slides || slides.length === 0) return null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full ${heightClass} rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-900 select-none group`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <a
            href={slides[current].link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full relative"
          >
            {/* Background Banner Image */}
            <img
              src={slides[current].image_url}
              alt={slides[current].title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />

            {/* Dark & Brand Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

            {/* Slide Text Content */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 right-16 sm:right-24 z-10 space-y-1 sm:space-y-1.5">
              {slides[current].badge && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E51B24] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{slides[current].badge}</span>
                </span>
              )}

              <h3 className={`${variant === 'hero' ? 'text-lg sm:text-2xl lg:text-3xl' : 'text-sm sm:text-lg'} font-black text-white leading-snug drop-shadow-md`}>
                {slides[current].title}
              </h3>

              {slides[current].subtitle && (
                <p className={`${variant === 'hero' ? 'text-xs sm:text-sm' : 'text-[11px]'} text-slate-200 font-medium line-clamp-1`}>
                  {slides[current].subtitle}
                </p>
              )}
            </div>

            {/* Top-right Callout */}
            <div className="absolute top-4 right-4 z-10">
              <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4" />
              </span>
            </div>
          </a>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-200 z-20 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-200 z-20 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Slide Indicators / Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-6 z-20 flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                current === idx ? 'w-5 bg-[#E51B24]' : 'w-1.5 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}