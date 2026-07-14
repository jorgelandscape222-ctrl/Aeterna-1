export type Requirement = {
  title: string;
  message: string;
  ctaLabel: string;
  targetTab: string;
  targetElementId: string;
};

export const PREREQUISITES: Record<string, Requirement> = {
  "generate-snapshot": {
    title: "Trigger required",
    message: "A preservation snapshot is taken after a continuity trigger fires and evidence is gathered. Run the Trigger Engine first, then return to create the snapshot.",
    ctaLabel: "Go to Trigger stage",
    targetTab: "trigger",
    targetElementId: "btn-satisfy-trigger",
  },
  "generate-bundle": {
    title: "Snapshot required",
    message: "A continuity bundle is assembled from a preservation snapshot. Create the snapshot first, then return here to package the bundle.",
    ctaLabel: "Go to Snapshot stage",
    targetTab: "snapshot",
    targetElementId: "btn-generate-snapshot",
  },
  "simulate-commercialization": {
    title: "Bundle required",
    message: "Commercialization licenses a sealed continuity bundle. Generate the bundle first, then simulate licensing here.",
    ctaLabel: "Go to Bundle stage",
    targetTab: "bundle",
    targetElementId: "btn-package-bundle",
  },
};
