"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export type Slide = {
  id: number;
  src: string;
  title: string;
  description: string;
  buttonText: string;
  buttonHref?: string;
};

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[88vh] min-h-[560px] overflow-hidden bg-[#1C1917]">
      <AnimatePresence mode="wait">
        {slides.map(
          (slide, index) =>
            index === current && (
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
              >
                {/* Zooming background */}
                <motion.div
                  className="w-full h-full relative"
                  initial={{ scale: 1.06 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 6, ease: "easeOut" }}
                >
                  <Image
                    src={slide.src}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="100vw"
                  />
                </motion.div>

                {/* Gradient overlay — warmer, premium feel */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-[1400px] w-full mx-auto px-5 md:px-12 lg:px-20 xl:px-32">
                    <motion.div
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.75, delay: 0.25, ease: "easeOut" }}
                      className="max-w-2xl"
                    >
                      {/* Eyebrow tag */}
                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex items-center gap-2 mb-5"
                      >
                        <span className="block w-8 h-[2px] bg-[#C9A96E]" />
                        <span className="text-[#C9A96E] text-xs font-bold tracking-[0.2em] uppercase">
                          Alfa Ventura
                        </span>
                      </motion.div>

                      <h1
                        className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-5"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {slide.title}
                      </h1>

                      <p className="text-base md:text-lg text-white/80 leading-[1.7] mb-8 max-w-xl">
                        {slide.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4">
                        <Link
                          href={slide.buttonHref || "/contact"}
                          className="inline-flex items-center gap-2.5 bg-[#9B7040] hover:bg-[#7A5520] text-white text-sm font-semibold px-7 py-3.5 rounded-lg shadow-[0_4px_20px_rgba(155,112,64,0.5)] hover:shadow-[0_6px_28px_rgba(155,112,64,0.6)] active:scale-[0.97] transition-all duration-200 tracking-wide"
                        >
                          {slide.buttonText}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                          href="/all-products"
                          className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors duration-200 group"
                        >
                          View Products
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "w-7 h-2 bg-[#C9A96E]"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Slide counter */}
      {/* <div className="absolute bottom-8 right-8 md:right-16 text-white/50 text-sm font-medium tabular-nums z-10">
        <span className="text-white/90 font-bold">{String(current + 1).padStart(2, "0")}</span>
        {" / "}
        {String(slides.length).padStart(2, "0")}
      </div> */}
    </div>
  );
}
