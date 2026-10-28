"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";

export interface GalleryMedia {
  url: string;
  type: "image" | "video";
}

/** Main view with crossfade + swipe, and a thumbnail strip under it. */
const ProductGallery = ({ media, title }: { media: GalleryMedia[]; title: string }) => {
  const [current, setCurrent] = useState(0);
  const count = media.length;
  if (!count) return null;

  const go = (i: number) => setCurrent(((i % count) + count) % count);
  const active = media[current];

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.2;
    if (swipe < -60) go(current + 1);
    else if (swipe > 60) go(current - 1);
  };

  return (
    <div
      className="space-y-3"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(current + 1);
        if (e.key === "ArrowLeft") go(current - 1);
      }}
      aria-label={`${title} images`}
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F5F1EA] border border-[#E8DDD0]">
        <motion.div
          className="absolute inset-0 touch-pan-y"
          drag={count > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={onDragEnd}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={active.url}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {active.type === "video" ? (
                <video src={active.url} controls className="w-full h-full object-contain bg-black" />
              ) : (
                <Image
                  src={active.url}
                  alt={`${title} - image ${current + 1}`}
                  fill
                  priority={current === 0}
                  draggable={false}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-contain select-none"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(current - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white shadow-md flex items-center justify-center text-[#1C1917] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => go(current + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white shadow-md flex items-center justify-center text-[#1C1917] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white">
              {current + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {media.map((m, i) => (
            <button
              key={m.url}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === current}
              className={`relative shrink-0 w-20 h-16 sm:w-24 sm:h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                i === current ? "border-[#9B7040] opacity-100" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {m.type === "video" ? (
                <span className="absolute inset-0 flex items-center justify-center bg-[#1C1917] text-white">
                  <PlayCircle className="w-6 h-6" />
                </span>
              ) : (
                <Image src={m.url} alt="" fill sizes="96px" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
