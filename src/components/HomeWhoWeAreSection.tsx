"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import SectionWrapper from "./SectionWrapper";
import { BsArrowUpRight } from "react-icons/bs";
import Link from "next/link";

const HomeWhoWeAreSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById("about-section");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section
      id="about-section"
      className="py-20 overflow-hidden px-5 md:px-40"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-36 items-center">
        {/* Left Side - Images */}
        <div className="relative h-[400px] lg:h-[600px]">
          {/* Main Kitchen Image - Flies in from right */}
          <div
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
            }`}
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/who.webp"
                alt="Modern kitchen with quartz countertops"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Shipping Container Image - Flies in from left with delay */}
          <div
            className={`absolute bottom-4 right-4 md:-right-20 w-48 h-32 md:w-64 md:h-40 transition-all duration-1000 ease-out delay-500 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
            }`}
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-xl border-4 border-white">
              <Image
                src="/ship1.jpg"
                alt="Shipping containers"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Content */}
        <div
          className={`space-y-6 transition-all duration-1000 ease-out delay-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Company Name */}
          <div className="text-sm font-medium text-gray-600 tracking-wider uppercase">ALFA VENTURA</div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            "Precision In Every Slab, <span className="block">Trust In Every Shipment"</span>
          </h1>

          {/* Description */}
          <div className="text-gray-600 text-sm leading-relaxed space-y-4 text-justify">
            <p>
              We are Alfa Ventura, a globally recognized export firm born from a vision to bridge Indian manufacturing excellence
              with world-class construction and infrastructure needs. Established in 2025, we specialize in exporting high-quality
              industrial and building materials, particularly artificial quartz slabs and fly ash, to demanding markets like the
              USA and UK.
            </p>

            <p>
              Our identity lies in precision, customization, and international compliance. With in-house prefabrication units and
              CNC workshops, we are equipped to offer cut-to-size quartz countertops, polished vanities, and engineered stone
              surfaces that save time and costs for global buyers.
            </p>

            <p>
              Our team comprises procurement specialists, logistics coordinators, and quality control professionals who work
              seamlessly to meet international benchmarks. Whether you are a developer sourcing bulk quartz slabs or a contractor
              looking for fly ash that meets Class F specifications, Alfa Ventura is your strategic sourcing partner.
            </p>
          </div>

          {/* Optional CTA Button */}
          <div className="pt-6">
            <Link
              href="/about"
              className="bg-alfa-primary hover:bg-alfa-blue text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl flex gap-2 items-center w-fit"
            >
              Learn More About Us
              <BsArrowUpRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionWrapper(HomeWhoWeAreSection, "home-who-we-are");
