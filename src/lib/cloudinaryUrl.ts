/** A resized, auto-format/quality version of a Cloudinary upload URL, for
 * small previews such as swatches. The originals are full PNG slab photos
 * (often 300-800 KB); a swatch only needs a few hundred pixels. Non-Cloudinary
 * URLs (local files) are returned unchanged. */
export const cloudinaryThumb = (url: string | undefined, width = 240) =>
  url?.includes("res.cloudinary.com") && url.includes("/upload/")
    ? url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`)
    : url;
