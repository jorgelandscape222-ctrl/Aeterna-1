export type Requirement = {
  title: string;
  message: string;
  ctaLabel: string;
  targetTab: string;
  targetElementId: string;
};

export const PREREQUISITES: Record<string, Requirement> = {
  "generate-bundle": {
    title: "Snapshot required",
    message: "A continuity bundle is assembled from a preservation snapshot. Create the snapshot first, then return here to package the bundle.",
    ctaLabel: "Go to Snapshot stage",
    targetTab: "snapshot",
    targetElementId: "btn-generate-snapshot",
  },
};
