import { FaBuilding, FaGlobe, FaShip } from "react-icons/fa";
import HeroSlider, { Slide } from "./ui/HeroSlider";

const slides: Slide[] = [
  {
    id: 1,
    // NOTE: Replace /ban2.webp with your preferred "export powerhouse" hero image
    // (e.g., a professional warehouse, cargo ship, or global trade visual)
    src: "/ban4.png",
    title: "USA's Building Materials Powerhouse",
    description:
      "Partner with Alfa Ventura for world-class engineered quartz surfaces, high-performance SPC flooring, and expertly crafted kitchen countertops — delivering global standards, superior quality, and enduring trust.",
    buttonText: "Request a Quote",
    buttonHref: "/contact",
  },
  {
    id: 2,
    src: "/quartz-multi-exotic.webp",
    title: "Custom Countertop Solutions",
    description:
      "From kitchen islands to commercial vanities — precision-cut engineered stone countertops, fabricated to exact specifications and polished for seamless, ready-to-install delivery worldwide.",
    buttonText: "Explore Products",
    buttonHref: "/all-products",
  },
  {
    id: 3,
    src: "/ban1.webp",
    title: "Engineered Quartz Slabs",
    description:
      "Precision-crafted slabs tailored for kitchens, vanities, and commercial interiors — ready-to-install with polished finishes and consistent quality you can count on.",
    buttonText: "Contact Us",
    buttonHref: "/contact",
  },
];

const companyValues = [
  {
    id: 1,
    icon: FaBuilding,
    title: "Mission",
    description:
      "Deliver top-quality engineered quartz globally through precision, compliance, and reliability — empowering projects with engineered excellence and customer-focused service.",
  },
  {
    id: 2,
    icon: FaGlobe,
    title: "Vision",
    description:
      "To build a leading U.S. quartz brand defined by uncompromising quality, design excellence, consistent performance, and enduring trust across international markets.",
  },
  {
    id: 3,
    icon: FaShip,
    title: "Values",
    description:
      "Integrity, precision, trust, innovation, and an unwavering commitment to quality drive every slab we ship and every client relationship we build worldwide.",
  },
];

const Hero = () => {
  return (
    <div className="relative">
      {/* Hero Slider */}
      <section className="relative w-full overflow-hidden">
        <HeroSlider slides={slides} />
      </section>

      {/* Mission / Vision / Values — overlapping strip */}
      <section className="relative -mt-14 z-10 px-5 md:px-12 lg:px-20 xl:px-32 mb-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {companyValues.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl p-7 border border-[#E8DDD0] shadow-[0_4px_16px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_32px_rgba(155,112,64,0.15)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#9B7040] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <Icon className="text-white text-lg" />
                  </div>
                  <h3
                    className="text-lg font-bold text-[#1C1917]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-[#57534E] leading-[1.7]">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Hero;
