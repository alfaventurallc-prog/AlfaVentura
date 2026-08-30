import type { Design } from "./design";

const STORAGE_KEY = "alfa-ventura-visualizer2-designs";
const AUTOSAVE_KEY = "alfa-ventura-visualizer2-autosave";

/**
 * Local persistence for "My Designs" -- swapping this for a real
 * Supabase/API-backed repository later means rewriting only this file;
 * nothing that calls DesignRepository needs to change (per Step 7's own
 * "make future backend integration easy" instruction). create/get/update/
 * delete/list all work on plain Design objects -- never a Three.js/React
 * object, per the serializer's own contract.
 */
const readAll = (): Design[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Design[]) : [];
  } catch {
    return [];
  }
};

const writeAll = (designs: Design[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  } catch {
    // Storage full/unavailable -- the design just won't persist; the
    // Visualizer itself keeps working from in-memory state.
  }
};

export const DesignRepository = {
  list: (): Design[] => readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),

  get: (id: string): Design | null => readAll().find((d) => d.id === id) ?? null,

  create: (design: Design): Design => {
    writeAll([...readAll(), design]);
    return design;
  },

  update: (design: Design): Design => {
    const all = readAll();
    const idx = all.findIndex((d) => d.id === design.id);
    if (idx === -1) return DesignRepository.create(design);
    all[idx] = design;
    writeAll(all);
    return design;
  },

  delete: (id: string): void => {
    writeAll(readAll().filter((d) => d.id !== id));
  },

  /**
   * "Share" for this project (no persisted-shared-design backend exists
   * yet -- see Step 7 report) means encoding the complete design into the
   * URL itself, so the link works on a different browser/device with zero
   * server involvement. Kept as one function so a future backend-backed
   * share (a short /visualizer/design/:id URL against a real API) is a
   * drop-in replacement here.
   */
  share: (design: Design): string => {
    const json = JSON.stringify(design);
    const encoded = typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(json))) : "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/visualizer-v2?d=${encodeURIComponent(encoded)}`;
  },

  decodeShared: (encoded: string): unknown => {
    try {
      const json = decodeURIComponent(escape(window.atob(decodeURIComponent(encoded))));
      return JSON.parse(json);
    } catch {
      return null;
    }
  },
};

/** Autosave slot (separate from named "My Designs" saves) -- restores the
 * in-progress session across a reload without requiring an explicit save. */
export const AutosaveStore = {
  read: (): Design | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(AUTOSAVE_KEY);
      return raw ? (JSON.parse(raw) as Design) : null;
    } catch {
      return null;
    }
  },
  write: (design: Design) => {
    try {
      window.localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(design));
    } catch {
      // best-effort only
    }
  },
  clear: () => {
    try {
      window.localStorage.removeItem(AUTOSAVE_KEY);
    } catch {
      // best-effort only
    }
  },
};
