import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact Us | Alfa Ventura",
  description: "Get in touch with Alfa Ventura — USA's premier engineered quartz export company.",
};

export default function ContactPage() {
  return (
    <main className="bg-[#FDFAF7]">
      {/* Banner */}
      <div className="relative h-56 md:h-72 bg-[#1C1917] flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/contact-us.png')" }}
        />
        <div className="relative z-10 px-5 md:px-12 lg:px-20 xl:px-32 pb-10 w-full">
          <span className="block text-[#C9A96E] text-xs font-semibold tracking-widest uppercase mb-2">
            Reach Out
          </span>
          <h1
            className="text-3xl md:text-5xl font-bold text-white leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Contact Us
          </h1>
        </div>
      </div>

      {/* Map */}
      <div className="px-5 md:px-12 lg:px-20 xl:px-32 pt-12">
        <div className="relative rounded-2xl overflow-hidden border border-[#E8DDD0] shadow-sm">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3264.6083336423476!2d-106.55805988720398!3d35.09151769198945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87220a95517c54df%3A0x6e3d67eaab0b4f51!2s1209%20Mountain%20Rd%20Pl%20NE%20n%2C%20Albuquerque%2C%20NM%2087110%2C%20USA!5e0!3m2!1sen!2sin!4v1771677850470!5m2!1sen!2sin"
            width="100%"
            height="380"
            style={{ border: 0, pointerEvents: "none" }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {/* Overlay card */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-md w-72 border border-[#E8DDD0]">
            <p
              className="font-bold text-[#1C1917] mb-2 text-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Alfa Ventura — USA Office
            </p>
            <p className="text-xs text-[#6B5E52] leading-relaxed">
              1209 Mountain Road Place NE, Suite N<br />
              Albuquerque, NM 87110, USA
            </p>
            <p className="text-xs text-[#9B7040] mt-2 font-medium">+1 (480) 791-5581</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-5 md:px-12 lg:px-20 xl:px-32 py-12 pb-20">
        <ContactForm />
      </div>
    </main>
  );
}

