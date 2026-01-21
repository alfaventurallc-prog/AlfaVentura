"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export interface MediaItem {
  url: string;
  type: string;
}

export interface MediaSliderProps {
  media: MediaItem[];
}

export default function ProductMediaSlider({ media }: MediaSliderProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchStartX.current - touchEndX > 50) {
      handleNext();
    } else if (touchEndX - touchStartX.current > 50) {
      handlePrev();
    }
  };

  return (
    <div>
      <div className="relative w-full h-full mx-auto rounded-2xl overflow-hidden md:shadow-lg md:border">
        {/* Media wrapper */}
        <div
          className="w-full h-64 sm:h-80 md:h-[30rem] bg-transparent flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={media[current].url}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="absolute w-full h-full flex items-center justify-center"
            >
              {media[current].type === "image" ? (
                <Image
                  src={media[current].url}
                  alt="media item"
                  className="w-full h-full object-contain"
                  width={1000}
                  height={1000}
                />
              ) : (
                <video
                  src={media[current].url}
                  controls
                  className="w-full h-full object-contain"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-center items-center gap-5 p-2 mt-5">
        {/* Prev button */}
        <button
          onClick={handlePrev}
          className="bg-white/70 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition hidden md:block"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="w-fit z-10 flex justify-center gap-2">
          {media.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full transition ${idx === current ? "bg-black" : "bg-gray-400"}`}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          className="bg-white/70 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition hidden md:block"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        {/* Dots */}
      </div>
    </div>
  );
}
