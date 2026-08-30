import type { Metadata } from "next";
import VisualizerV2Shell from "@/components/visualizer2/VisualizerV2Shell";

export const metadata: Metadata = {
  title: "3D Visualizer (Preview) — Alfa Ventura",
  description: "An early, in-progress preview of Alfa Ventura's new interactive 3D visualizer.",
};

export default function VisualizerV2Page() {
  return (
    <section className="bg-[#FDFAF7] py-12 md:py-20 px-5 md:px-10 xl:px-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#9B7040] border-l-[3px] border-[#9B7040] pl-3 mb-4">
            Alfa Ventura
          </span>
          <h1
            className="text-3xl md:text-5xl font-bold text-[#1C1917] leading-tight mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            3D Visualizer — Foundation Preview
          </h1>
          <p className="text-[#57534E] text-base md:text-lg max-w-2xl leading-relaxed">
            Step 1 of a new interactive 3D visualizer: a real 3D room with independently selectable surfaces. Rotate,
            zoom, and click a surface below — material selection and product application come in later steps.
          </p>
        </div>

        <VisualizerV2Shell />
      </div>
    </section>
  );
}
