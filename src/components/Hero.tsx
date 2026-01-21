import Image from "next/image";
import HeroSlider, { Slide } from "./ui/HeroSlider";
import { FaBuilding, FaGlobe, FaShip } from "react-icons/fa";

const slides: Slide[] = [
  {
    id: 1,
    src: "/ban3.webp",
    title: "INDIA'S EXPORT POWERHOUSE",
    description:
      "Partner With Alfa Ventura For Globally Compliant Industrial Materials — Built On Quality, Trust, And Innovation.",
    buttonText: "Request A Quote",
  },
  {
    id: 2,
    src: "/ban2.webp",
    title: "Fly Ash for Infrastructure",
    description:
      "High-quality Class F fly ash in bulk quantities, suitable for durable construction and eco-friendly cement blends.",
    buttonText: "Explore",
  },
  {
    id: 3,
    src: "/ban1.webp",
    title: "Engineered Quartz Slabs",
    description:
      "Precision-crafted slabs tailored for kitchens, vanities, and commercial interiors — ready-to-install with polished finishes.",
    buttonText: "Contact Us",
  },
];

const companyValues = [
  {
    id: 1,
    icon: FaBuilding,
    title: "Mission",
    description:
      "Deliver top-quality construction materials globally through precision, compliance, and reliability, empowering projects with engineered excellence and customer-focused service.",
  },
  {
    id: 2,
    icon: FaGlobe,
    title: "Vision",
    description:
      "Be the preferred global exporter of engineered quartz and fly ash by combining innovation, Indian craftsmanship, and world-class delivery standards.",
  },
  {
    id: 3,
    icon: FaShip,
    title: "Values",
    description:
      "Integrity, precision, trust, innovation, and commitment to quality drive every product we export and every client relationship we build worldwide.",
  },
];

const Hero = () => {
  return (
    <div className="relative">
      {/* Hero Slider Section */}
      <section className="relative w-full h-[80vh] overflow-hidden">
        <HeroSlider slides={slides} />
      </section>

      {/* Mission, Vision, Values Section - Overlapping */}
      <section className="relative -mt-16 z-10 px-5 md:px-40 animate-slideup">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {companyValues.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-lg p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 backdrop-blur-sm group hover:border hover:border-alfa-blue"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-alfa-blue rounded-lg flex items-center justify-center mr-4 shadow-md group-hover:scale-x-[-1] transform transition-all duration-300">
                    <IconComponent className="text-white text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{item.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Hero;
