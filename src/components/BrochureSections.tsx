import Image from "next/image";
import React from "react";

const sections = [
  {
    title: "Available Sizes",
    description:
      "Custom fabrication services are available for large volume orders. Minimum quantity requirements apply. Please contact us for eligibility and details.",
    imgSrc: "/img55.png",
    imgAlt: "Available sizes diagram",
    reverse: false,
  },
  {
    title: "Edge Profiles",
    description:
      "We recommend a minimum 1/8″ radius on both the top and bottom of any edge. For high-traffic areas, a 1/4″ radius is best for added safety and durability.",
    imgSrc: "/img-21.png",
    imgAlt: "Edge profiles diagram",
    reverse: true,
  },
];

export default function BrochureSections() {
  return (
    <div className="bg-[#FDFAF7]">
      {sections.map(({ title, description, imgSrc, imgAlt, reverse }, idx) => (
        <section
          key={idx}
          className={`container mx-auto px-4 py-12 flex flex-col ${
            reverse ? "md:flex-row-reverse" : "md:flex-row"
          } items-center gap-8`}
        >
          {/* Image */}
          <div className="w-full md:w-1/2 flex-shrink-0">
            <Image
              src={imgSrc}
              alt={imgAlt}
              width={600}
              height={400}
              className="w-full h-auto rounded-2xl shadow-sm border border-[#E8DDD0]"
            />
          </div>

          {/* Text */}
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1C1917] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
            <p className="text-[#6B5E52] leading-relaxed">{description}</p>
          </div>
        </section>
      ))}
    </div>
  );
}
