"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
  type PanInfo,
} from "motion/react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { Category } from "../../types";

type ShowcaseCategory = Category & { parentSlug?: string };

interface FeaturesSectionProps {
  categories: ShowcaseCategory[];
}

const AUTOPLAY_SECONDS = 6;
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Styled lifestyle photos for the showcase, matched on the category name.
// The category's own admin image is the fallback for anything not listed.
const SHOWCASE_IMAGES: { match: RegExp; src: string }[] = [
  { match: /floor/i, src: "/home-categories/flooring.webp" },
  { match: /vanit/i, src: "/home-categories/vanities.webp" },
  { match: /cabinet/i, src: "/home-categories/cabinets.webp" },
  { match: /slab|quartz/i, src: "/home-categories/quartz.webp" },
];

const showcaseImage = (category: ShowcaseCategory) =>
  SHOWCASE_IMAGES.find((s) => s.match.test(category.name))?.src ?? category.imageUrl ?? "/placeholder.jpg";

const categoryHref = (category: ShowcaseCategory) =>
  category.parentId ? `/${category.parentSlug ?? category.parentId}/${category.slug}` : `/${category.slug}`;

// Subcategories arrive named "Parent > Child"; show the child as the title
// and the parent as a small label above it.
const splitName = (name: string) => {
  const parts = name.split(" > ");
  return parts.length > 1 ? { parent: parts[0], title: parts.slice(1).join(" > ") } : { parent: null, title: name };
};

const FeaturesSection = ({ categories }: FeaturesSectionProps) => {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const progress = useMotionValue(0);
  const draggedRef = useRef(false);

  const count = categories.length;
  const paused = hovered || pageHidden || !!reduceMotion;

  const goTo = useCallback(
    (next: number, dir: number) => {
      if (!count) return;
      setDirection(dir);
      progress.set(0);
      setIndex(((next % count) + count) % count);
    },
    [count, progress]
  );
  const goNext = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  // Autoplay: the progress bar's own animation drives the slide change, so
  // pausing (hover, hidden tab) freezes the bar exactly where it is.
  useEffect(() => {
    if (paused || count < 2) return;
    const controls: AnimationPlaybackControls = animate(progress, 1, {
      duration: AUTOPLAY_SECONDS * (1 - progress.get()),
      ease: "linear",
      onComplete: goNext,
    });
    return () => controls.stop();
  }, [paused, count, index, progress, goNext]);

  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.2;
    if (swipe < -80) goNext();
    else if (swipe > 80) goPrev();
    // a click fires right after pointerup; let the Explore link ignore it
    setTimeout(() => (draggedRef.current = false), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  };

  const active = categories[index];
  const activeName = active ? splitName(active.name) : null;

  return (
    <section className="bg-[#1C1917] py-20 md:py-24 px-4 md:px-8 lg:px-16 xl:px-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE_OUT }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-14"
        >
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#C9A96E] border-l-[3px] border-[#C9A96E] pl-3 mb-4">
            Our Products
          </span>
          <h2
            className="text-3xl md:text-5xl font-bold text-white leading-tight mb-5 tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Your trusted source for
            <br />
            <span className="text-[#C9A96E]">premium surfaces</span> worldwide
          </h2>
          <p className="text-[#A8A29E] text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Engineered quartz, cabinetry and flooring, selected for consistency in colour, pattern and finish.
          </p>
        </motion.div>

        {!count || !active || !activeName ? (
          <p className="text-center text-[#A8A29E] py-12">No categories to show yet.</p>
        ) : (
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Product categories"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] focus-visible:outline-none"
          >
            {/* Stage */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-auto lg:min-h-[560px] rounded-3xl overflow-hidden bg-[#292524] border border-white/10"
            >
              <motion.div
                className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-y"
                drag={count > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragStart={() => (draggedRef.current = true)}
                onDragEnd={handleDragEnd}
              >
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={active.id}
                    custom={direction}
                    className="absolute inset-0"
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.08, x: direction * 40 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: EASE_OUT }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      initial={{ scale: 1 }}
                      animate={reduceMotion ? { scale: 1 } : { scale: 1.06 }}
                      transition={{ duration: AUTOPLAY_SECONDS + 1, ease: "linear" }}
                    >
                      <Image
                        src={showcaseImage(active)}
                        alt={activeName.title}
                        fill
                        priority={index === 0}
                        draggable={false}
                        sizes="(min-width: 1024px) 900px, 100vw"
                        className="object-cover select-none"
                      />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent pointer-events-none" />
              </motion.div>

              {/* Counter */}
              <div className="absolute top-5 left-5 md:top-7 md:left-8 flex items-center gap-2 text-white/80 text-xs font-bold tracking-[0.2em] pointer-events-none">
                <span className="text-white">{String(index + 1).padStart(2, "0")}</span>
                <span className="w-8 h-px bg-white/40" />
                <span>{String(count).padStart(2, "0")}</span>
              </div>

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between pointer-events-none">
                {/* Keyed remount, no exit: the new text staggers in the moment
                    the slide changes instead of waiting for the old text to leave. */}
                <motion.div
                    key={active.id}
                    className="max-w-xl"
                    initial="textHidden"
                    animate="textShow"
                    variants={{
                      textHidden: {},
                      textShow: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
                    }}
                  >
                    {[
                      activeName.parent ? (
                        <span key="p" className="block text-[11px] font-bold tracking-[0.2em] uppercase text-[#C9A96E] mb-2">
                          {activeName.parent}
                        </span>
                      ) : null,
                      <h3
                        key="t"
                        className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.05] tracking-tight mb-3"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {activeName.title}
                      </h3>,
                      active.description ? (
                        <p key="d" className="text-white/75 text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-2">
                          {active.description}
                        </p>
                      ) : null,
                    ]
                      .filter(Boolean)
                      .map((child, i) => (
                        <motion.div
                          key={i}
                          variants={{
                            textHidden: { opacity: 0, y: 18 },
                            textShow: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
                          }}
                        >
                          {child}
                        </motion.div>
                      ))}
                  </motion.div>

                <div className="flex items-center gap-3 shrink-0 pointer-events-auto">
                  <Link
                    href={categoryHref(active)}
                    onClick={(e) => draggedRef.current && e.preventDefault()}
                    className="group inline-flex items-center gap-2 rounded-full bg-[#C9A96E] px-5 py-3 text-sm font-bold text-[#1C1917] transition-colors duration-300 hover:bg-white"
                  >
                    Explore
                    {active._count?.products ? (
                      <span className="text-[#1C1917]/60 font-semibold">
                        {active._count.products} {active._count.products === 1 ? "design" : "designs"}
                      </span>
                    ) : null}
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                  {count > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        aria-label="Previous category"
                        className="w-11 h-11 rounded-full border border-white/25 bg-black/30 backdrop-blur-sm text-white flex items-center justify-center transition-colors duration-200 hover:bg-white hover:text-[#1C1917] active:scale-95"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        aria-label="Next category"
                        className="w-11 h-11 rounded-full border border-white/25 bg-black/30 backdrop-blur-sm text-white flex items-center justify-center transition-colors duration-200 hover:bg-white hover:text-[#1C1917] active:scale-95"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Category list (desktop) / progress pills (mobile) */}
            <div className="flex lg:flex-col gap-2 lg:gap-3 justify-center">
              {categories.map((category, i) => {
                const name = splitName(category.name);
                const isActive = i === index;
                return (
                  <motion.button
                    key={category.id}
                    type="button"
                    onClick={() => goTo(i, i > index ? 1 : -1)}
                    aria-label={`Show ${name.title}`}
                    aria-current={isActive}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.15 + i * 0.07 }}
                    className={`relative overflow-hidden text-left transition-colors duration-300 rounded-full lg:rounded-2xl h-1.5 lg:h-auto lg:flex lg:items-center lg:gap-4 lg:p-3 lg:border ${
                      isActive
                        ? "w-12 lg:w-auto bg-white/15 lg:bg-white/[0.07] lg:border-[#C9A96E]/50"
                        : "w-6 lg:w-auto bg-white/15 lg:bg-white/[0.03] lg:border-white/10 hover:lg:bg-white/[0.06]"
                    }`}
                  >
                    <span className="hidden lg:block relative w-[72px] h-[72px] shrink-0 rounded-xl overflow-hidden">
                      <Image
                        src={showcaseImage(category)}
                        alt=""
                        fill
                        sizes="72px"
                        className={`object-cover transition-transform duration-500 ${isActive ? "scale-110" : "scale-100"}`}
                      />
                    </span>
                    <span className="hidden lg:block min-w-0 flex-1">
                      {name.parent && (
                        <span className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#A8A29E] truncate">
                          {name.parent}
                        </span>
                      )}
                      <span
                        className={`block font-bold leading-snug truncate transition-colors duration-300 ${isActive ? "text-white" : "text-white/70"}`}
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {name.title}
                      </span>
                      {category._count?.products ? (
                        <span className="block text-xs text-[#A8A29E] mt-0.5">
                          {category._count.products} {category._count.products === 1 ? "design" : "designs"}
                        </span>
                      ) : null}
                    </span>
                    {/* autoplay progress: fills the pill on mobile, a thin bar under the card on desktop */}
                    {isActive && (
                      <motion.span
                        aria-hidden
                        className="absolute left-0 bottom-0 h-full lg:h-[2px] w-full origin-left bg-[#C9A96E]"
                        style={{ scaleX: progress }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SectionWrapper(FeaturesSection, "featuresSection");
