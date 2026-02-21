import { FiShield } from "react-icons/fi";
import { FaGlobeAmericas } from "react-icons/fa";
import { TbSettingsCog } from "react-icons/tb";
import { HiOutlineUserGroup } from "react-icons/hi";
import { LuLeaf } from "react-icons/lu";
import { FaHandshake } from "react-icons/fa";

export const NAV_LINKS = [
  { href: "/", key: "home", label: "Home" },
  { href: "/about", key: "how_alfa_ventura_works", label: "About Us" },
  { href: "/contact", key: "contact_us", label: "Contact Us" },
];

export const PEOPLE_URL = ["/person-1.png", "/person-2.png", "/person-3.png", "/person-4.png"];

export const FEATURES = [
  {
    title: " Quartz",
    icon: "/map.svg",
    variant: "green",
    description:
      "We provide a solution for you to be able to use our application when climbing, yes offline maps you can use at any time there is no signal at the location",
  },
  {
    title: "Marbel",
    icon: "/calendar.svg",
    variant: "green",
    description:
      "Schedule an adventure with friends. On holidays, there are many interesting offers from Hilink. That way, there's no more discussion",
  },
  {
    title: " Tiles",
    icon: "/tech.svg",
    variant: "green",
    description:
      "Technology uses augmented reality as a guide to your hiking trail in the forest to the top of the mountain. Already supported by the latest technology without an internet connection",
  },
  {
    title: "Fly Ash",
    icon: "/location.svg",
    variant: "orange",
    description:
      "Lots of new locations every month, because we have a worldwide community of climbers who share their best experiences with climbing",
  },
];

export const FOOTER_LINKS = [
  {
    title: "Learn More",
    links: [
      { label: "About Alfa Ventura", href: "/about" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Our Community",
    links: [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/goyama-international-llp/",
      },
      {
        label: "Instagram",
        href: "https://www.instagram.com/goyama_international/",
      },
    ],
  },
];

export const FOOTER_CONTACT_INFO = {
  title: "Contact Us",
  links: [
    { label: "Sales Officer", value: "+1 (480) 791-5581" },
    { label: "Admin Office 1", value: "+91 7303940226" },
    { label: "Admin Office 2", value: "+91 8384054004" },
    { label: "Email Officer", value: " goyamainternationllp@gmail.com" },
  ],
};

export const VALUES = [
  {
    title: "Integrity in Every Shipment",
    description:
      "We believe in doing business the right way—with honesty, fairness, and full transparency. Our clients can trust that what we promise is what we deliver.",
    icon: FiShield,
  },
  {
    title: "Precision & Performance",
    description:
      "From CNC-driven quartz fabrication to quality-controlled packaging, we prioritize accuracy, consistency, and durability in every product.",
    icon: TbSettingsCog,
  },
  {
    title: "Client-First Thinking",
    description:
      "We don’t just supply materials—we solve problems. Our approach is proactive, flexible, and built around making our clients' projects easier and more efficient.",
    icon: HiOutlineUserGroup,
  },
  {
    title: "Global Quality, Local Commitment",
    description:
      "By combining the strength of Indian manufacturing with international benchmarks, we ensure our materials meet and exceed global expectations.",
    icon: FaGlobeAmericas,
  },
  {
    title: "Sustainability & Responsibility",
    description:
      "We are committed to sustainable sourcing and responsible distribution. Our aim is to deliver materials that not only build structures—but also contribute to a better-built world.",
    icon: LuLeaf,
  },
  {
    title: "Partnership Over Transaction",
    description:
      "We value long-term relationships over short-term gains. Every client is a partner, and we go the extra mile to earn and keep their trust.",
    icon: FaHandshake,
  },
];
