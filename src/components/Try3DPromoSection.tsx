import Image from "next/image";
import Link from "next/link";

const Try3DPromoSection = () => {
  return (
    <section className="bg-[#1C1917] py-16 px-5 md:px-10 xl:px-16">
      <div className="max-w-[1200px] mx-auto rounded-3xl bg-gradient-to-r from-[#2A2420] to-[#1C1917] border border-white/10 overflow-hidden flex flex-col md:flex-row items-center">
        <div className="flex-1 p-8 md:p-12 text-center md:text-left">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#C9A96E] mb-4">
            New
          </span>
          <h2
            className="text-2xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            See It Before You Choose It
          </h2>
          <p className="text-[#A8A29E] text-base mb-6 max-w-md mx-auto md:mx-0">
            Rotate, zoom, and compare our quartz finishes in an interactive 3D preview.
          </p>
          <Link href="/3d-try" className="btn-primary inline-flex">
            Try in 3D
          </Link>
        </div>
        <div className="flex-1 relative w-full h-56 md:h-72">
          <Image src="/quartz-calacatta-series.webp" alt="Quartz slab preview" fill className="object-cover" />
        </div>
      </div>
    </section>
  );
};

export default Try3DPromoSection;
