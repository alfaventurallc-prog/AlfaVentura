/**
 * Maps a product's real category name (from the DB) to the visualizer
 * space/application slots it can realistically be shown on. This is a
 * keyword heuristic over real category assignments — not invented data.
 */
export interface SupportedApplication {
  spaceId: string;
  applicationId: string;
  label: string;
}

const RULES: { test: (categoryName: string) => boolean; targets: SupportedApplication[] }[] = [
  {
    test: (c) => /vanit/i.test(c),
    targets: [
      { spaceId: "bathroom", applicationId: "vanity", label: "Bathroom Vanity" },
      { spaceId: "kitchen", applicationId: "island", label: "Kitchen Island" },
    ],
  },
  {
    test: (c) => /countertop|slab/i.test(c),
    targets: [
      { spaceId: "kitchen", applicationId: "countertop", label: "Kitchen Countertop" },
      { spaceId: "kitchen", applicationId: "island", label: "Kitchen Island" },
      { spaceId: "kitchen", applicationId: "backsplash", label: "Kitchen Backsplash" },
    ],
  },
  {
    test: (c) => /cabinet/i.test(c),
    targets: [{ spaceId: "kitchen", applicationId: "countertop", label: "Kitchen Countertop" }],
  },
];

const DEFAULT_TARGETS: SupportedApplication[] = [
  { spaceId: "kitchen", applicationId: "countertop", label: "Kitchen Countertop" },
];

export const getSupportedApplications = (categoryName: string): SupportedApplication[] => {
  const rule = RULES.find((r) => r.test(categoryName));
  return rule ? rule.targets : DEFAULT_TARGETS;
};
