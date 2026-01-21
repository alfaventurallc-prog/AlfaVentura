"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaLongArrowAltRight } from "react-icons/fa";
import { useRouter } from "nextjs-toploader/app";

export type Slide = {
  id: number;
  src: string;
  title: string;
  description: string;
  buttonText: string;
};

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[80vh] overflow-hidden">
      <AnimatePresence>
        {slides.map(
          (slide, index) =>
            index === current && (
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                {/* Zooming Background Image ONLY */}
                <motion.div
                  className="w-full h-full relative"
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.1 }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                >
                  <Image
                    src={slide.src}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>

                {/* Overlay Text */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center md:justify-start -mt-8">
                  <div className="px-5 md:px-40 max-w-3xl text-center md:text-left animate-slideup">
                    <h1 className="text-4xl font-bold text-white mb-3 leading-snug uppercase">{slide.title}</h1>
                    <p className="text-lg text-gray-200 mb-5">{slide.description}</p>
                    <button
                      onClick={() => router.push("/contact")}
                      className="px-5 flex gap-2 items-center py-2 bg-alfa-primary hover:underline text-white text-sm md:text-base font-medium rounded-md shadow-md transition-all mx-auto md:ml-0"
                    >
                      {slide.buttonText}
                      <FaLongArrowAltRight />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>
    </div>
  );
}
