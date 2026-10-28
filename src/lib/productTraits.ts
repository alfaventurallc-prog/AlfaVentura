// Colour and style tags inferred from a product's title and description, used
// by the catalog filters and "You may also like". The catalog has no colour
// field, but descriptions consistently name the base ("a bright white base")
// and the look ("Calacatta", "speckled", "oak").

export interface Trait {
  id: string;
  label: string;
}

const COLOURS: (Trait & { re: RegExp })[] = [
  { id: "white", label: "White", re: /\b(white|bianco|snow|ivory|off-white)\b/i },
  { id: "grey", label: "Grey", re: /\b(grey|gray|silver|greige)\b/i },
  { id: "black", label: "Black & Charcoal", re: /\b(black|charcoal|nero|slate|espresso)\b/i },
  { id: "beige", label: "Beige & Brown", re: /\b(beige|cream|taupe|sand|sandy|honey|chestnut|brown|oak)\b/i },
  { id: "colour", label: "Blue & Green", re: /\b(blue|green|jade|aqua|amazonite|sage|turquoise)\b/i },
];

const GOLD: Trait & { re: RegExp } = { id: "gold", label: "Gold Veins", re: /\b(gold|golden|amber|brass-toned)\b/i };

const STYLES: (Trait & { re: RegExp })[] = [
  { id: "calacatta", label: "Calacatta", re: /calacatt?a/i },
  { id: "carrara", label: "Carrara", re: /carrara/i },
  { id: "statuario", label: "Statuario", re: /statuario/i },
  { id: "printed", label: "Printed Quartz", re: /printed quartz/i },
  { id: "speckled", label: "Speckled & Solid", re: /speckle|granite-inspired|near-solid|no veining|uniform look/i },
  // "oak look" / "wood-grain", not a bare "oak": quartz descriptions say things like "pairs well with light oak"
  { id: "wood", label: "Wood Look", re: /oak look|wood-grain|wood grain|natural beauty of oak/i },
];

export const COLOUR_TRAITS: Trait[] = [...COLOURS, GOLD].map(({ id, label }) => ({ id, label }));
export const STYLE_TRAITS: Trait[] = STYLES.map(({ id, label }) => ({ id, label }));

/** Up to three words right before "base"/"surface" ("veins against a white
 * base" -> "against a white"); a wider window would also catch the vein
 * colour ("Calacatta Black" is a white slab with black veins). */
const wordsBefore = (description: string, noun: string) =>
  description.match(new RegExp(`((?:[a-z-]+\\s+){1,3})${noun}\\b`, "i"))?.[1] ?? "";

export const productTraits = (title: string, description: string | null) => {
  const text = description ?? "";
  const coloursIn = (s: string) => COLOURS.filter((c) => c.re.test(s)).map((c) => c.id);
  // base colour first, then a named surface, then title + first sentence
  let colours = coloursIn(wordsBefore(text, "base"));
  if (!colours.length) colours = coloursIn(wordsBefore(text, "surface"));
  if (!colours.length) colours = coloursIn(`${title} ${text.split(".")[0]}`);
  if (GOLD.re.test(`${title} ${text}`)) colours.push(GOLD.id);
  const styles = STYLES.filter((s) => s.re.test(`${title} ${text}`)).map((s) => s.id);
  return { colours, styles };
};

/** "Design code: GI8098W." / "Model number: 8001-15." / "Finish code: SW." */
export const productCode = (description: string | null) =>
  description?.match(/(?:Design code|Model number|Finish code):\s*([A-Z0-9][A-Z0-9-]*)/i)?.[1] ?? null;
