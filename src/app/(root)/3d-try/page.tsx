import type { Metadata } from "next";
import ThreeDTryTabs from "@/components/ThreeDTryTabs";

export const metadata: Metadata = {
  title: "Try Our Quartz in 3D — Alfa Ventura",
  description:
    "Explore Alfa Ventura's engineered quartz designs in an interactive 3D viewer — rotate, zoom, and switch between finishes.",
};

export default function ThreeDTryPage() {
  return (
    <section className="bg-[#FDFAF7] py-16 md:py-24 px-5 md:px-10 xl:px-16">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#9B7040] border-l-[3px] border-[#9B7040] pl-3 mb-4">
            Interactive Preview
          </span>
          <h1
            className="text-3xl md:text-5xl font-bold text-[#1C1917] leading-tight mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Try Our Quartz Slabs in 3D
          </h1>
          <p className="text-[#57534E] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Drag to rotate, scroll or pinch to zoom, and switch between our most popular finishes to see how each
            one looks.
          </p>
        </div>

        <ThreeDTryTabs />
      </div>
    </section>
  );
}
