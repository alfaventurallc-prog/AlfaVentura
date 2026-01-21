"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { FaLongArrowAltRight, FaPause, FaPlay } from "react-icons/fa";
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
    <section className="bg-gradient-to-b from-gray-900 to-black py-20 px-4 md:px-8 lg:px-16 xl:px-20 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        
        * {
          font-family: 'Poppins', sans-serif;
        }
        
        .slider-container {
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
          touch-action: pan-y;
        }
        
        .slider-container:active {
          cursor: grabbing;
        }
        
        .slider-container.dragging {
          cursor: grabbing;
        }
        
        .slider-content {
          will-change: transform;
        }
        
        .card-item {
          pointer-events: auto;
        }
        
        .card-item.no-click {
          pointer-events: none;
        }
      `}</style>

      <div className="mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-blue-400 font-semibold text-lg mb-4 tracking-wider uppercase">Our Products</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
            Your trusted source for
            <br />
            <span className="text-blue-400">premium materials</span> worldwide
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover our comprehensive range of high-quality quartz slabs and industrial materials
          </p>
        </motion.div>

        {/* Drag Instructions */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">💡 Drag to navigate • Click to explore</p>
        </div>

        {/* Infinite Slider Container */}
        <div className="relative">
          {/* Play/Pause Button */}
          {/* <button
            onClick={togglePlayPause}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full p-3 transition-all duration-300"
          >
            {isPlaying ? <FaPause className="text-white text-lg" /> : <FaPlay className="text-white text-lg" />}
          </button> */}

          {!duplicatedCategories.length ? <LoadingSpinner /> : null}

          {/* Draggable Slider */}
          <div
            ref={containerRef}
            className={`overflow-hidden pt-2.5 mt-8 slider-container ${isDragging ? "dragging" : ""}`}
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
                    className="flex-shrink-0 px-4"
                    style={{ width: `${itemWidth || 300}px` }}
                  >
                    <motion.div
                      whileHover={{ y: -10 }}
                      transition={{ type: "spring", damping: 20, stiffness: 200 }}
                      className="group"
                    >
                      <div
                        className={`card-item ${draggedDistance > 10 ? "no-click" : ""}`}
                        onClick={(e) =>
                          handleCardClick(e, category.parentId ? `/${category.parentId}/${category.slug}` : `/${category.slug}`)
                        }
                      >
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:border-blue-400/50 cursor-pointer">
                          {/* Image */}
                          <div className="relative h-64 overflow-hidden">
                            <Image
                              src={category.imageUrl || "/placeholder.jpg"}
                              alt={category.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              draggable={false}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          </div>

                          {/* Content */}
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                              {category.name}
                            </h3>
                            <p className="text-gray-300 text-sm mb-4 line-clamp-2 whitespace-pre-line">{category.description}</p>
                            <div className="flex items-center text-blue-400 font-semibold group-hover:text-blue-300 transition-colors duration-300">
                              Explore More
                              <FaLongArrowAltRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
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
