// Service-area landing pages: /locations/[slug].
// Alfa Ventura has NO address in these cities -- they are areas it supplies
// and delivers to, so the pages never show a local street address or local
// phone number and the JSON-LD uses areaServed (not a second LocalBusiness).
// Keep every claim to what the business confirmed for that area.

import type { ContentSection, Faq } from "./seoContent";

export interface ServiceArea {
  city: string;
  /** two-letter state code */
  state: string;
  stateName: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** nearby communities, shown as plain text */
  nearby: string[];
  sections: ContentSection[];
  faqs: Faq[];
}

export const LOCATIONS: Record<string, ServiceArea> = {
  "indianapolis-in": {
    city: "Indianapolis",
    state: "IN",
    stateName: "Indiana",
    title: "Quartz Countertops & Quartz Slabs in Indianapolis, IN",
    description:
      "Engineered quartz slabs, countertops and vanity tops delivered in Indianapolis, IN, with fabrication and installation, cabinets and SPC flooring. Request a quote today.",
    h1: "Quartz Countertops & Quartz Slabs in Indianapolis, IN",
    intro:
      "Alfa Ventura supplies engineered quartz slabs, quartz countertops and vanity tops to homeowners, contractors, builders and fabricators in Indianapolis. Choose from 150+ designs, preview them in our 3D visualizer, and we deliver to your Indianapolis project, with fabrication and installation available.",
    nearby: ["Carmel", "Fishers", "Noblesville", "Westfield", "Zionsville", "Greenwood", "Avon", "Plainfield", "Brownsburg", "Lawrence"],
    sections: [
      {
        heading: "Quartz slab supply and delivery in Indianapolis",
        paragraphs: [
          "Whether you are remodeling one kitchen or building out a full development, we supply engineered quartz slabs for your Indianapolis project and deliver them to you. Our range covers Calacatta and Carrara marble looks, warm beige and cream tones, crisp whites, greys and bold dark designs.",
          "Fabricators and contractors can order by the slab for ongoing work, and homeowners can choose a design and get a complete countertop quote.",
        ],
      },
      {
        heading: "Fabrication and installation",
        paragraphs: [
          "Need finished countertops rather than raw slabs? We can arrange fabrication and installation for Indianapolis kitchens, bathrooms and commercial spaces: cutting to your layout, edge profiles, sink and cooktop cut-outs, waterfall islands and full-height backsplashes.",
        ],
      },
      {
        heading: "Where our quartz is used",
        bullets: [
          "Kitchen countertops and waterfall islands",
          "Bathroom vanity tops and shower walls",
          "Full-height backsplashes and feature walls",
          "Commercial counters for offices, restaurants, retail and hospitality",
          "Multi-unit and new-build residential projects",
        ],
      },
      {
        heading: "Cabinets and SPC flooring too",
        paragraphs: [
          "Complete the room with our kitchen cabinets and waterproof SPC flooring, supplied to Indianapolis alongside your quartz. Ordering countertops, cabinets and flooring together keeps one point of contact for your whole project.",
        ],
      },
      {
        heading: "See it before you buy",
        paragraphs: [
          "Use our free 3D visualizer to try any quartz design on a kitchen, bathroom, living or commercial space, together with cabinet finishes and flooring. You can also request a sample of the designs you like before you decide.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do you deliver quartz slabs to Indianapolis?",
        a: "Yes. We supply and deliver engineered quartz slabs to projects in Indianapolis and nearby communities. Send us your designs, quantities and project address for a quote.",
      },
      {
        q: "Can you fabricate and install quartz countertops in Indianapolis?",
        a: "Yes. Fabrication and installation can be arranged for Indianapolis projects, including cutting to your layout, edge profiles, cut-outs and waterfall islands. Share your measurements or drawings and we will prepare a quote.",
      },
      {
        q: "Do you work with Indianapolis fabricators, contractors and builders?",
        a: "Yes. We supply trade customers by the slab, from single jobs to multi-unit and commercial projects. See our trade page or contact us with your project details.",
      },
      {
        q: "Can I see a quartz design before ordering?",
        a: "Yes. Try any design in our free 3D visualizer, and request a sample of the designs you are considering.",
      },
      {
        q: "Do you also supply cabinets and flooring in Indianapolis?",
        a: "Yes. Along with quartz we supply kitchen cabinets and SPC flooring to Indianapolis projects.",
      },
    ],
  },
};

export const locationPath = (slug: string) => `/locations/${slug}`;
