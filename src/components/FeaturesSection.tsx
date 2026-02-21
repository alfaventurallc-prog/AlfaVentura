"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { FaLongArrowAltRight } from "react-icons/fa";
import SectionWrapper from "./SectionWrapper";
import { motion } from "framer-motion";
import { Category } from "../../types";
import { getCategories } from "@/actions/categories";
import LoadingSpinner from "./LoadingSpinner";

const FeaturesSection = () => {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [itemWidth, setItemWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startTranslate, setStartTranslate] = useState(0);
  const [draggedDistance, setDraggedDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);

  const duplicatedCategories = [...categories, ...categories, ...categories];

  useEffect(() => {
    const fetchData = async () => {
      const res = await getCategories({ includeSubcategories: true });
      if (res.success && res.data) {
        const filteredCategories = res.data.categories.flatMap((cat) =>
          cat.subcategories && cat.subcategories.length > 0
            ? cat.subcategories.map((sub) => ({
                ...sub,
                name: `${cat.name} > ${sub.name}`,
              }))
            : [cat]
        );

        // @ts-ignore
        setCategories(filteredCategories);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const updateItemWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        let itemsPerView = 3;

        if (window.innerWidth < 768) {
          itemsPerView = 1;
        } else if (window.innerWidth < 1024) {
          itemsPerView = 2;
        }

        setItemWidth(containerWidth / itemsPerView);
      }
    };

    updateItemWidth();
    window.addEventListener("resize", updateItemWidth);
    return () => window.removeEventListener("resize", updateItemWidth);
  }, []);

  useEffect(() => {
    if (!isPlaying || isDragging || !itemWidth) return;

    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = currentTime;

      const deltaTime = currentTime - lastTimeRef.current;
      const speed = 50;
      const moveDistance = (speed * deltaTime) / 1000;

      setCurrentTranslate((prev) => {
        const newTranslate = prev - moveDistance;
        const resetPoint = -(categories.length * itemWidth);

        if (newTranslate <= resetPoint) {
          return 0;
        }

        return newTranslate;
      });

      lastTimeRef.current = currentTime;

      if (isPlaying && !isDragging) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    lastTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isDragging, itemWidth, categories.length]);

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setStartTranslate(currentTranslate);
    setDraggedDistance(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;

    const currentX = clientX;
    const diff = currentX - startX;
    const distance = Math.abs(diff);

    setDraggedDistance(distance);

    const dragMultiplier = 1.2;
    const newTranslate = startTranslate + diff * dragMultiplier;

    const resetPoint = -(categories.length * itemWidth);

    if (newTranslate > 0) {
      setCurrentTranslate(resetPoint + (newTranslate % (categories.length * itemWidth)));
    } else if (newTranslate < resetPoint) {
      setCurrentTranslate(newTranslate % resetPoint);
    } else {
      setCurrentTranslate(newTranslate);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (draggedDistance > 50) {
      const momentum = Math.min(draggedDistance * 2, 200);
      const direction = startX > startX + draggedDistance ? -1 : 1;

      setTimeout(() => {
        if (!isDragging) {
          setCurrentTranslate((prev) => {
            const newPos = prev + momentum * direction;
            const resetPoint = -(categories.length * itemWidth);

            if (newPos > 0) {
              return resetPoint + (newPos % (categories.length * itemWidth));
            } else if (newPos < resetPoint) {
              return newPos % resetPoint;
            }
            return newPos;
          });
        }
      }, 50);
    }

    setTimeout(() => {
      setDraggedDistance(0);
    }, 200);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientX);
  };

  const handleCardClick = (e: React.MouseEvent, url: string) => {
    if (draggedDistance > 10) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    router.push(url);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleDragMove(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleDragMove(e.touches[0].clientX);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove, { passive: false });
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
      document.addEventListener("touchend", handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("touchmove", handleGlobalTouchMove);
      document.removeEventListener("touchend", handleGlobalTouchEnd);
    };
  }, [isDragging, startX, startTranslate]);

  return (
    <section className="bg-[#1C1917] py-20 px-4 md:px-8 lg:px-16 xl:px-20 overflow-hidden">
      <style>{`
        .slider-container { cursor: grab; user-select: none; -webkit-user-select: none; touch-action: pan-y; }
        .slider-container:active { cursor: grabbing; }
        .slider-container.dragging { cursor: grabbing; }
        .slider-content { will-change: transform; }
        .card-item { pointer-events: auto; }
        .card-item.no-click { pointer-events: none; }
      `}</style>

      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          viewport={{ once: true }}
          className="text-center mb-14"
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
            Discover our comprehensive range of high-quality engineered quartz slabs and stone surfaces.
          </p>
          <p className="text-[#6B7280] text-sm mt-3">💡 Drag to navigate · Click to explore</p>
        </motion.div>

        {/* Infinite Slider */}
        <div className="relative">
          {!duplicatedCategories.length ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : null}

          <div
            ref={containerRef}
            className={`overflow-hidden pt-2.5 mt-6 slider-container ${isDragging ? "dragging" : ""}`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleDragEnd}
            onMouseEnter={togglePlayPause}
            onMouseLeave={togglePlayPause}
          >
            <div
              ref={sliderRef}
              className="flex slider-content"
              style={{
                transform: `translateX(${currentTranslate}px)`,
                width: `${duplicatedCategories.length * (itemWidth || 300)}px`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
            >
              {duplicatedCategories.length &&
                duplicatedCategories.map((category, index) => (
                  <div
                    key={`${category.name}-${index}`}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${itemWidth || 300}px` }}
                  >
                    <motion.div
                      whileHover={{ y: -8 }}
                      transition={{ type: "spring", damping: 22, stiffness: 220 }}
                      className="group"
                    >
                      <div
                        className={`card-item ${draggedDistance > 10 ? "no-click" : ""}`}
                        onClick={(e) =>
                          handleCardClick(
                            e,
                            category.parentId ? `/${category.parentId}/${category.slug}` : `/${category.slug}`
                          )
                        }
                      >
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-[#C9A96E]/40 cursor-pointer transition-all duration-300">
                          {/* Image */}
                          <div className="relative h-60 overflow-hidden">
                            <Image
                              src={category.imageUrl || "/placeholder.jpg"}
                              alt={category.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              draggable={false}
                              sizes="400px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          </div>
                          {/* Content */}
                          <div className="p-6">
                            <h3
                              className="text-lg font-bold text-white mb-2 group-hover:text-[#C9A96E] transition-colors duration-300"
                              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            >
                              {category.name}
                            </h3>
                            <p className="text-[#A8A29E] text-sm mb-4 line-clamp-2 leading-relaxed">
                              {category.description}
                            </p>
                            <div className="flex items-center text-[#C9A96E] font-semibold text-sm group-hover:text-white transition-colors duration-300">
                              Explore
                              <svg
                                className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionWrapper(FeaturesSection, "featuresSection");
