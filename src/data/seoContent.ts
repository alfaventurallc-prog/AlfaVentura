// Long-form page copy for search: quartz look collections, buying guides
// and category intros. Keep every claim to what Alfa Ventura actually
// offers (see About/Home copy) or to general, well-established facts about
// engineered quartz -- no prices, warranties, certifications, slab sizes or
// lead times unless the business confirms them.

export interface ContentSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface Faq {
  q: string;
  a: string;
}

/* ------------------------------------------------------------------ */
/* Quartz look collections: /quartz/[slug]                             */
/* ------------------------------------------------------------------ */

export interface Collection {
  /** productTraits id the products are filtered by */
  trait: { kind: "colour" | "style"; id: string };
  /** short name used in links and breadcrumbs */
  name: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: ContentSection[];
  faqs: Faq[];
}

export const COLLECTIONS: Record<string, Collection> = {
  calacatta: {
    trait: { kind: "style", id: "calacatta" },
    name: "Calacatta Quartz",
    title: "Calacatta Quartz Slabs & Countertops",
    description:
      "Calacatta quartz slabs with bold, marble-look veining on bright white backgrounds. Browse Alfa Ventura's Calacatta designs for kitchens, islands and vanities across the USA.",
    h1: "Calacatta Quartz Slabs & Countertops",
    intro:
      "Calacatta quartz recreates the look of Italy's most sought-after marble: a bright white background crossed by bold, dramatic veins. Engineered quartz gives you that statement look without the etching, staining and resealing that natural Calacatta marble needs, which is why it has become the go-to choice for kitchen islands, waterfall edges and full-height backsplashes.",
    sections: [
      {
        heading: "Why choose Calacatta quartz",
        bullets: [
          "Statement veining that reads as luxury marble from across the room",
          "Non-porous surface that does not need sealing, unlike natural marble",
          "Consistent slab-to-slab look, so large islands and seams are easier to plan",
          "Works with white, wood, navy, green and black cabinetry alike",
        ],
      },
      {
        heading: "Where Calacatta quartz works best",
        paragraphs: [
          "Because the veining is the hero, Calacatta looks best on large, uninterrupted surfaces: an island top with waterfall ends, a full-height backsplash cut from the same slab, or a floating bathroom vanity. Ask us about vein direction and book-matching when you plan seams, so the pattern flows across the joint.",
          "Want to see a design in place first? Every slab below can be previewed on countertops, backsplashes, vanities and feature walls in our free 3D visualizer.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Calacatta quartz the same as Calacatta marble?",
        a: "No. Calacatta marble is a natural stone quarried in Italy. Calacatta quartz is engineered stone designed to look like it, made mostly from crushed quartz bound with resin, so it is non-porous and does not need sealing.",
      },
      {
        q: "What is the difference between Calacatta and Carrara quartz?",
        a: "Calacatta designs have a brighter white background with bolder, thicker and more dramatic veins. Carrara designs have a softer grey-white background with fine, feathery veining for a quieter look.",
      },
    ],
  },
  carrara: {
    trait: { kind: "style", id: "carrara" },
    name: "Carrara Quartz",
    title: "Carrara Quartz Slabs & Countertops",
    description:
      "Carrara quartz slabs with soft grey, feathery veining for a timeless marble look. See Alfa Ventura's Carrara designs for kitchens and bathrooms across the USA.",
    h1: "Carrara Quartz Slabs & Countertops",
    intro:
      "Carrara quartz takes its cue from classic Carrara marble: a soft white-to-grey background with fine, feathery grey veins. It is a quieter, more versatile look than Calacatta, which makes it easy to pair with almost any cabinet color, hardware finish or flooring.",
    sections: [
      {
        heading: "Why designers specify Carrara quartz",
        bullets: [
          "Subtle veining that suits traditional, transitional and modern spaces",
          "Hides everyday crumbs and water spots better than solid white",
          "Non-porous and low-maintenance compared with natural marble",
          "A safe choice for resale: neutral, light and widely liked",
        ],
      },
      {
        heading: "Pairing ideas",
        paragraphs: [
          "Carrara quartz pairs naturally with white shaker cabinets and polished nickel or chrome hardware for a classic kitchen, or with grey and green cabinetry and brass for a warmer look. In bathrooms it works on vanity tops, shower walls and tub surrounds.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does Carrara quartz look like real marble?",
        a: "Modern Carrara quartz designs closely imitate the soft grey veining of Carrara marble. The difference is mainly in performance: quartz is non-porous, so it resists stains from wine, coffee and oil without sealing.",
      },
    ],
  },
  statuario: {
    trait: { kind: "style", id: "statuario" },
    name: "Statuario Quartz",
    title: "Statuario Quartz Slabs & Countertops",
    description:
      "Statuario quartz slabs with crisp white backgrounds and striking grey veins. Explore Alfa Ventura's Statuario designs for high-end kitchens, vanities and walls.",
    h1: "Statuario Quartz Slabs & Countertops",
    intro:
      "Statuario quartz is inspired by Statuario marble, prized for its luminous white background and striking, high-contrast grey veins. It is a confident, gallery-like look that suits modern kitchens, statement islands and feature walls.",
    sections: [
      {
        heading: "Statuario vs. Calacatta vs. Carrara",
        bullets: [
          "Statuario: bright white background, bold grey veins, high contrast",
          "Calacatta: bright white background, bold veins that are often warmer or gold-toned",
          "Carrara: softer grey-white background, fine feathery veins",
        ],
      },
      {
        heading: "Best uses",
        paragraphs: [
          "Use Statuario quartz where you want the stone to be the focal point: islands, waterfall edges, full-height backsplashes and fireplace or TV feature walls. Plan seams carefully so the main veins line up.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Statuario quartz good for a busy kitchen?",
        a: "Yes. Like all engineered quartz it is non-porous and stain-resistant, so it handles daily cooking well. Use trivets for hot pans, since quartz resin can be damaged by direct high heat.",
      },
    ],
  },
  white: {
    trait: { kind: "colour", id: "white" },
    name: "White Quartz",
    title: "White Quartz Countertops & Slabs",
    description:
      "White quartz countertops and slabs, from pure white to marble-look veining. Browse Alfa Ventura's white quartz designs for kitchens and bathrooms across the USA.",
    h1: "White Quartz Countertops & Slabs",
    intro:
      "White quartz is the most popular countertop color in American kitchens, and for good reason: it brightens a room, makes spaces feel larger and works with every cabinet color. Our white quartz range runs from clean, near-solid whites to marble-look designs with soft or bold veining.",
    sections: [
      {
        heading: "Choosing the right white",
        bullets: [
          "Near-solid white: clean, modern and minimal",
          "Soft veining (Carrara look): forgiving and timeless",
          "Bold veining (Calacatta / Statuario look): a luxury statement",
          "Warm whites with gold or beige veins: pair with wood and brass",
        ],
      },
      {
        heading: "Will white quartz stain?",
        paragraphs: [
          "Engineered quartz is non-porous, so spills such as coffee, wine and oil sit on the surface instead of soaking in. Wipe spills promptly with mild soap and water, avoid harsh chemicals and abrasive pads, and use trivets for hot cookware.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does white quartz turn yellow?",
        a: "Indoors, quality quartz holds its color well. The resin can discolor with prolonged direct sunlight (UV) or exposure to high heat, which is why quartz is recommended for indoor use and hot pans should go on a trivet.",
      },
    ],
  },
  grey: {
    trait: { kind: "colour", id: "grey" },
    name: "Grey Quartz",
    title: "Grey Quartz Countertops & Slabs",
    description:
      "Grey quartz countertops and slabs, from light concrete looks to deep charcoal. See Alfa Ventura's grey quartz designs for modern kitchens and bathrooms in the USA.",
    h1: "Grey Quartz Countertops & Slabs",
    intro:
      "Grey quartz bridges warm and cool palettes. Light greys feel airy and modern, mid-tone concrete looks suit industrial and transitional spaces, and deep charcoal greys add drama without the starkness of black. Grey is also very practical: it hides everyday marks better than pure white.",
    sections: [
      {
        heading: "Popular grey quartz looks",
        bullets: [
          "Light grey with soft veining for bright, calm kitchens",
          "Concrete-look greys for modern and industrial spaces",
          "Charcoal greys with white veins for contrast with white cabinets",
        ],
      },
      {
        heading: "Pairing grey quartz",
        paragraphs: [
          "Grey quartz pairs well with white, green or wood cabinets, matte black or brushed nickel hardware, and both oak and grey plank flooring. Try any grey design with your cabinet finish in the 3D visualizer before you decide.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is grey quartz still in style?",
        a: "Grey remains a staple for modern and transitional kitchens. Warmer greys and greys with white veining are especially versatile because they work with both cool and warm cabinet colors.",
      },
    ],
  },
  black: {
    trait: { kind: "colour", id: "black" },
    name: "Black Quartz",
    title: "Black Quartz Countertops & Slabs",
    description:
      "Black and charcoal quartz countertops and slabs, including black quartz with white or gold veins. Browse Alfa Ventura's dark quartz designs for kitchens in the USA.",
    h1: "Black Quartz Countertops & Slabs",
    intro:
      "Black quartz makes a bold, sophisticated statement. Deep black and charcoal designs, often crossed with white or gold veins, ground a light kitchen, frame a modern island or turn a bathroom vanity into a focal point.",
    sections: [
      {
        heading: "Designing with black quartz",
        bullets: [
          "Pair with white or light wood cabinets for crisp contrast",
          "Use with brass or gold hardware for a luxury look",
          "Choose a veined design to soften the solid black",
          "Add under-cabinet lighting to keep the space bright",
        ],
      },
      {
        heading: "Care tips for dark quartz",
        paragraphs: [
          "Dark surfaces show water spots and fingerprints more than light ones. A quick wipe with a soft cloth, mild soap and water keeps black quartz looking polished. Avoid bleach and abrasive cleaners.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does black quartz scratch easily?",
        a: "Quartz is a very hard surface and resists everyday scratches, but always use a cutting board: knives dull quickly on stone, and scratches of any kind show more on dark, polished surfaces.",
      },
    ],
  },
  "gold-veined": {
    trait: { kind: "colour", id: "gold" },
    name: "Gold Veined Quartz",
    title: "Gold Veined Quartz Countertops & Slabs",
    description:
      "Gold veined quartz slabs with warm gold and amber veining on white, grey and black backgrounds. Explore Alfa Ventura's gold quartz designs for luxury kitchens.",
    h1: "Gold Veined Quartz Countertops & Slabs",
    intro:
      "Gold veined quartz adds warmth and luxury to a space. Fine gold or amber veins running through white, grey or black backgrounds pick up brass hardware, warm lighting and wood tones, making these designs a favorite for statement islands and powder rooms.",
    sections: [
      {
        heading: "How to style gold veined quartz",
        bullets: [
          "Repeat the gold with brass or champagne bronze hardware and fixtures",
          "Pair white-and-gold designs with navy, green or white cabinets",
          "Use black-and-gold designs for dramatic islands and bars",
          "Keep the backsplash simple, or run the same slab up the wall",
        ],
      },
    ],
    faqs: [
      {
        q: "Is gold veined quartz a passing trend?",
        a: "Warm-toned, marble-look surfaces have stayed popular as interiors move away from cool all-grey palettes. Choosing a design where the gold is an accent rather than the dominant color keeps it timeless.",
      },
    ],
  },
  speckled: {
    trait: { kind: "style", id: "speckled" },
    name: "Speckled & Solid Quartz",
    title: "Speckled & Solid Color Quartz Slabs",
    description:
      "Speckled and near-solid quartz slabs with a uniform, granite-inspired or minimal look. Durable, practical quartz designs for kitchens, offices and commercial spaces.",
    h1: "Speckled & Solid Color Quartz Slabs",
    intro:
      "Speckled and near-solid quartz designs offer a uniform, practical look. With no large veins to match across seams, they are easy to fabricate and install, hide crumbs and everyday wear well, and suit busy family kitchens, offices, reception desks and other commercial projects.",
    sections: [
      {
        heading: "Why choose a uniform quartz",
        bullets: [
          "No vein matching needed at seams, so large runs look seamless",
          "Forgiving for high-traffic kitchens and commercial counters",
          "A clean backdrop for patterned tile backsplashes",
          "Often the most cost-effective way to cover large areas",
        ],
      },
    ],
    faqs: [
      {
        q: "Is speckled quartz good for commercial projects?",
        a: "Yes. Uniform designs are easy to repeat across multiple units, offices or locations, and their consistent pattern hides daily wear in busy spaces.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Guides: /guides/[slug]                                              */
/* ------------------------------------------------------------------ */

export interface Guide {
  title: string;
  description: string;
  h1: string;
  published: string;
  intro: string;
  sections: ContentSection[];
  faqs: Faq[];
  /** collection slugs to link at the end */
  related: string[];
}

export const GUIDES: Record<string, Guide> = {
  "quartz-vs-granite-countertops": {
    title: "Quartz vs. Granite Countertops: Which Is Better?",
    description:
      "Quartz vs. granite countertops compared: durability, maintenance, heat resistance, looks and cost. A clear guide for US homeowners, designers and contractors.",
    h1: "Quartz vs. Granite Countertops: Which Is Better for You?",
    published: "2026-11-12",
    intro:
      "Quartz and granite are the two most popular stone countertops in the United States. Both are durable and beautiful, but they are made differently, look different and need different care. Here is a side-by-side comparison to help you choose.",
    sections: [
      {
        heading: "What each material is",
        paragraphs: [
          "Granite is a natural stone, quarried in large blocks and cut into slabs. Every slab is unique, with the color and pattern nature gave it.",
          "Engineered quartz is manufactured: crushed natural quartz is mixed with resin binders and pigments, then pressed and cured into slabs. That process makes it possible to create consistent colors and marble-look veining such as Calacatta, Carrara and Statuario.",
        ],
      },
      {
        heading: "Maintenance",
        paragraphs: [
          "Quartz is non-porous, so it does not need sealing and resists stains from coffee, wine and oil. Granite is porous to varying degrees and is usually sealed periodically to keep it stain-resistant.",
        ],
      },
      {
        heading: "Heat and sunlight",
        paragraphs: [
          "Granite handles heat well. Quartz is heat-resistant for everyday use, but the resin can be damaged by very hot cookware, so trivets are recommended. The resin can also discolor under long, direct sun exposure, so quartz is best used indoors; granite is the better pick for outdoor kitchens.",
        ],
      },
      {
        heading: "Look and consistency",
        paragraphs: [
          "If you want a specific marble look, a clean white or a consistent color across a large project, quartz is easier to plan because slabs are uniform. If you want a one-of-a-kind natural pattern, granite delivers that, but you should pick your exact slab.",
        ],
      },
      {
        heading: "Quick comparison",
        bullets: [
          "Sealing: quartz no; granite usually yes",
          "Stain resistance: quartz very high; granite good when sealed",
          "Heat: granite better; quartz needs trivets",
          "Outdoor use: granite yes; quartz not recommended",
          "Pattern: quartz consistent; granite unique per slab",
          "Marble look: quartz is the easier way to get it",
        ],
      },
      {
        heading: "Our recommendation",
        paragraphs: [
          "For most indoor kitchens and bathrooms, quartz is the lower-maintenance choice and offers the widest range of modern and marble-look designs. Choose granite for outdoor kitchens or if you love the individuality of natural stone.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is quartz more expensive than granite?",
        a: "It depends on the specific design and the project. Entry-level granite and quartz are often similar, while premium marble-look quartz and exotic granites both cost more. Ask us for a quote on the exact designs you are considering.",
      },
      {
        q: "Which adds more value to a home?",
        a: "Both are seen as premium upgrades over laminate. Quartz in neutral, light designs is especially popular with today's buyers.",
      },
    ],
    related: ["calacatta", "white", "grey"],
  },
  "quartz-countertop-buying-guide": {
    title: "Quartz Countertop Buying Guide for Homeowners & Contractors",
    description:
      "How to choose a quartz countertop: colors and veining, thickness, edge profiles, seams and how to order samples. A practical buying guide for US projects.",
    h1: "Quartz Countertop Buying Guide",
    published: "2026-11-12",
    intro:
      "Choosing quartz is easier when you know which decisions matter. This guide walks through color and pattern, thickness, edge profile, seams and samples, so you can order with confidence, whether you are remodeling one kitchen or supplying a multi-unit project.",
    sections: [
      {
        heading: "1. Start with the look",
        paragraphs: [
          "Decide the overall feel first: bright and marble-like (Calacatta, Carrara, Statuario), warm with gold veins, modern grey or concrete, dramatic black, or a uniform speckled design. Then narrow it down by how it pairs with your cabinets and floor.",
        ],
      },
      {
        heading: "2. Choose a thickness",
        paragraphs: [
          "Quartz countertops are commonly made in 2 cm (about 3/4\") and 3 cm (about 1 1/4\") thicknesses. 3 cm is the usual choice for kitchen countertops in the US; 2 cm is often used for vanities, backsplashes and wall cladding, or built up with a mitered edge for a thicker look.",
        ],
      },
      {
        heading: "3. Pick an edge profile",
        paragraphs: [
          "A square (eased) edge looks clean and modern. A beveled or rounded edge softens the corner and is more forgiving of knocks. Mitered edges make a countertop look extra thick and are ideal for waterfall islands.",
        ],
      },
      {
        heading: "4. Plan seams and vein direction",
        paragraphs: [
          "Large kitchens and islands may need more than one slab. With veined designs, ask your fabricator to lay out the slabs so the veins flow across seams and waterfall edges. Uniform designs make seams easier to hide.",
        ],
      },
      {
        heading: "5. See it before you buy",
        bullets: [
          "Preview designs in our free 3D visualizer on countertops, backsplashes, vanities and walls",
          "Request a sample to see the color in your own lighting",
          "View full slab photos on each product page before choosing",
        ],
      },
    ],
    faqs: [
      {
        q: "Do I need to seal quartz countertops?",
        a: "No. Engineered quartz is non-porous and does not need sealing. Clean it with mild soap and water.",
      },
      {
        q: "Can quartz be used in bathrooms?",
        a: "Yes. Quartz is widely used for vanity tops, shower walls and tub surrounds because it is non-porous and easy to clean.",
      },
    ],
    related: ["calacatta", "carrara", "speckled"],
  },
  "how-to-clean-quartz-countertops": {
    title: "How to Clean & Care for Quartz Countertops",
    description:
      "Simple daily cleaning, stain removal and dos and don'ts for quartz countertops. Keep your engineered quartz looking new for years.",
    h1: "How to Clean and Care for Quartz Countertops",
    published: "2026-11-12",
    intro:
      "Quartz is one of the easiest countertops to live with. It does not need sealing, and a few simple habits keep it looking new.",
    sections: [
      {
        heading: "Daily cleaning",
        bullets: [
          "Wipe with a soft cloth or sponge, warm water and a little mild dish soap",
          "Dry with a microfiber cloth to avoid water spots, especially on dark quartz",
          "Wipe spills promptly, particularly wine, coffee, oil and food coloring",
        ],
      },
      {
        heading: "Stubborn marks",
        paragraphs: [
          "For dried-on food, gently scrape with a plastic putty knife, then clean as usual. For grease, a non-abrasive cleaner labeled safe for quartz works well.",
        ],
      },
      {
        heading: "What to avoid",
        bullets: [
          "Hot pans and baking sheets directly on the surface: use trivets",
          "Bleach, oven cleaner, paint strippers and other harsh chemicals",
          "Abrasive powders and scouring pads",
          "Cutting directly on the countertop: use a cutting board",
          "Long direct sun exposure, which can discolor the resin over time",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I use disinfecting wipes on quartz?",
        a: "Occasional use of mild disinfecting products is generally fine, but avoid bleach-based and highly alkaline or acidic cleaners for routine cleaning. Rinse with water afterwards.",
      },
    ],
    related: ["white", "black"],
  },
};

/* ------------------------------------------------------------------ */
/* Category page content, shown below the products                     */
/* ------------------------------------------------------------------ */

export const CATEGORY_CONTENT: Record<string, { sections: ContentSection[]; faqs: Faq[] }> = {
  "engineered-quartz-slab": {
    sections: [
      {
        heading: "Engineered quartz slabs for kitchens, baths and commercial projects",
        paragraphs: [
          "Alfa Ventura is a USA-based quartz company headquartered in Albuquerque, New Mexico. We supply engineered quartz slabs in more than 150 designs, from bright Calacatta and Statuario marble looks to soft Carrara veining, warm gold-veined stones, modern greys, dramatic blacks and uniform speckled colors.",
          "Working with a network of manufacturers, fabricators and CNC workshops, we can supply full slabs as well as cut-to-size countertops and polished vanity tops for residential remodels, new builds and commercial projects.",
        ],
      },
      {
        heading: "Why engineered quartz",
        bullets: [
          "Non-porous: resists stains and does not need sealing",
          "Hard and durable for everyday kitchen use",
          "Consistent color and pattern, ideal for large and multi-unit projects",
          "Marble looks without marble's maintenance",
        ],
      },
    ],
    faqs: [
      {
        q: "Who do you supply?",
        a: "Homeowners, interior designers, contractors, builders and fabricators. Trade buyers can contact us for project pricing and supply.",
      },
      {
        q: "Can I see a slab in a room before ordering?",
        a: "Yes. Every quartz design can be previewed in our free 3D visualizer on kitchen countertops, backsplashes, bathroom vanities, living-room feature walls and commercial reception desks.",
      },
    ],
  },
  "countertops-vanities": {
    sections: [
      {
        heading: "Quartz for countertops, islands and vanity tops",
        paragraphs: [
          "Every design in this collection can be used for kitchen countertops, islands with waterfall edges, backsplashes and bathroom vanity tops. Filter by color and style above, open any design to see full slab and installed photos, and request a sample or a quote straight from the product page.",
        ],
      },
    ],
    faqs: [
      {
        q: "What thickness should I choose?",
        a: "3 cm is the most common choice for US kitchen countertops; 2 cm is popular for vanities, backsplashes and walls. Ask us which options are available for the design you like.",
      },
    ],
  },
  cabinets: {
    sections: [
      {
        heading: "Cabinets built to your project's specifications",
        paragraphs: [
          "Alfa Ventura supplies kitchen and bathroom cabinets built to the requirements of each project, in finishes including white shaker, green shaker, white oak, espresso, antique white and grey. Pair them with any of our quartz countertops and preview the combination in the 3D visualizer.",
        ],
      },
    ],
    faqs: [],
  },
  "spc-flooring": {
    sections: [
      {
        heading: "SPC flooring for homes and commercial spaces",
        paragraphs: [
          "SPC (stone plastic composite) flooring has a rigid core made from limestone powder and polymers, topped with a printed design layer and a wear layer. It is dimensionally stable, highly water-resistant and comfortable underfoot, which makes it a practical choice for kitchens, basements, rentals and commercial spaces.",
          "Our SPC designs include oak, grey and warm wood looks. Try any of them under your kitchen in the 3D visualizer.",
        ],
      },
    ],
    faqs: [],
  },
};

export const collectionPath = (slug: string) => `/quartz/${slug}`;
export const guidePath = (slug: string) => `/guides/${slug}`;
