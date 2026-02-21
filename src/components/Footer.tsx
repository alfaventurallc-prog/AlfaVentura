import Image from "next/image";
import Link from "next/link";
import { Instagram, Phone, MapPin, Mail } from "lucide-react";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/all-products", label: "Products" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

const Footer = () => (
  <footer className="bg-[#1C1917] text-[#A8A29E]">
    {/* Main content */}
    <div className="max-w-[1400px] mx-auto px-5 md:px-12 lg:px-20 xl:px-32 py-14 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
        {/* Brand column */}
        <div className="lg:col-span-2 space-y-5">
          <Link href="/" aria-label="Alfa Ventura Home">
            <Image
              src="/new_logo.png"
              alt="Alfa Ventura Logo"
              width={140}
              height={55}
              className="object-contain brightness-0 invert opacity-90"
            />
          </Link>
          <p className="text-sm leading-[1.75] max-w-sm">
            USA-based premium exporter and importer of engineered quartz slabs and stone surfaces — delivering precision, quality, and
            reliability to clients across the United States and global markets.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="https://wa.me/14807915581"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-[#A8A29E] hover:text-white hover:border-[#9B7040] hover:bg-[#9B7040]/10 transition-all duration-200"
            >
              {/* WhatsApp icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
            </Link>
            <Link
              href="https://www.instagram.com/alfaventura_/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-[#A8A29E] hover:text-white hover:border-[#9B7040] hover:bg-[#9B7040]/10 transition-all duration-200"
            >
              <Instagram className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <h4
            className="text-white text-sm font-bold tracking-wide uppercase"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Quick Links
          </h4>
          <ul className="space-y-2.5">
            {quickLinks.map((lnk) => (
              <li key={lnk.href}>
                <Link
                  href={lnk.href}
                  className="text-sm hover:text-[#C9A96E] transition-colors duration-200"
                >
                  {lnk.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4
            className="text-white text-sm font-bold tracking-wide uppercase"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Contact
          </h4>
          <ul className="space-y-4">
            <li>
              <a href="tel:+14807915581" className="flex items-start gap-3 text-sm hover:text-[#C9A96E] transition-colors group">
                <Phone className="w-4 h-4 shrink-0 mt-0.5 group-hover:text-[#9B7040] transition-colors" />
                +1 (480) 791-5581
              </a>
            </li>
            <li>
              <a
                href="https://www.google.com/maps/place/1209+Mountain+Rd+Pl+NE+n,+Albuquerque,+NM+87110,+USA/@35.0914191,-106.5605992,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-sm hover:text-[#C9A96E] transition-colors group"
              >
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 group-hover:text-[#9B7040] transition-colors" />
                1209 Mountain Road Place NE, STE N, Albuquerque, NM 87110, USA
              </a>
            </li>
            <li>
              <a href="mailto:info@alfa-ventura.com" className="flex items-start gap-3 text-sm hover:text-[#C9A96E] transition-colors group">
                <Mail className="w-4 h-4 shrink-0 mt-0.5 group-hover:text-[#9B7040] transition-colors" />
                info@alfa-ventura.com
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-white/8">
      <div className="max-w-[1400px] mx-auto px-5 md:px-12 lg:px-20 xl:px-32 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
        <p>&copy; {new Date().getFullYear()} Alfa Ventura. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy-policy" className="hover:text-[#C9A96E] transition-colors">Privacy Policy</Link>
          <span className="text-white/20">|</span>
          <Link href="/privacy-policy" className="hover:text-[#C9A96E] transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
