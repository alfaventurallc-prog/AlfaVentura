import Image from "next/image";
import Link from "next/link";
import { CiLinkedin } from "react-icons/ci";
import { FaInstagram, FaPhone } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlineMail } from "react-icons/md";

const Footer = () => (
  <footer className="bg-[url('/footer.jpg')] text-gray-400 bg-top bg-cover py-12 px-5 md:px-20 flex flex-col gap-10 justify-between">
    <div className="flex flex-col md:flex-row gap-10 justify-between">
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            aria-label="Alfa Ventura Home"
          >
            <Image
              src="/new_logo.png"
              alt="Alfa Ventura Logo"
              width={150}
              height={100}
            />
          </Link>
          <p className="hidden md:block text-justify">
            We are Alfa Ventura, a globally recognized export firm born from a vision to bridge Indian manufacturing excellence
            with world-class construction and infrastructure needs
          </p>
        </div>

        <div className="flex items-center gap-3 text-2xl">
          <Link
            href="https://www.linkedin.com/company/goyama-international-llp/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-all"
          >
            <CiLinkedin />
          </Link>
          <Link
            href="https://www.instagram.com/goyama_international/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-allr"
          >
            <FaInstagram />
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:ml-10 gap-5 text-xl md:w-1/2">
        <Link
          href="/"
          className="hover:text-white transition-all"
        >
          Home
        </Link>
        <Link
          href="/about"
          className="hover:text-white transition-all"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="hover:text-white transition-all"
        >
          Contact
        </Link>
      </div>

      <div className="flex flex-col gap-5 text-lg md:w-1/2">
        <div className="flex items-center gap-3 hover:text-white transition-all">
          <FaPhone className="transform scale-x-[-1] w-5" />
          <a href="tel:+14807915581">
            +1 (480)791-5581
          </a>
        </div>

        <div className="flex items-center gap-3 hover:text-white transition-all">
          <FaLocationDot className="w-5" />
          <a
            href="https://www.google.com/maps/place/1209+Mountain+Rd+Pl+NE+n,+Albuquerque,+NM+87110,+USA/@35.0914191,-106.5605992,17z/data=!3m1!4b1!4m5!3m4!1s0x87220a95517c54df:0x6e3d67eaab0b4f51!8m2!3d35.0914147!4d-106.5580243?authuser=0&entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
          >
            1209 Mountain Road Place Northeast STE N, Albuquerque, NM 87110, USA
          </a>
        </div>

        <div className="flex items-center gap-3 underline hover:text-white transition-all">
          <MdOutlineMail className="w-5" />
          <a href="mailto:info@alfa-ventura.com">info@alfa-ventura.com</a>
        </div>
      </div>
    </div>

    <hr />

    <div className="flex flex-col md:flex-row items-center justify-center md:justify-between text-sm text-gray-400">
      <p className="whitespace-nowrap">&copy; {new Date().getFullYear()} Alfa Ventura. All rights reserved.</p>

      <div className="mt-2 md:mt-0">
        <Link
          href="/privacy-policy"
          className="hover:text-gray-200 transition-all underline"
        >
          Privacy Policy
        </Link>
        {" | "}
        <Link
          href="/terms-of-service"
          className="hover:text-gray-200 transition-all underline"
        >
          Terms of Service
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
