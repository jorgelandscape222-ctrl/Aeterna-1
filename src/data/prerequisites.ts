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
  "run-reconstitution": {
    title: "Sealed bundle required",
    message: "The reconstitution sandbox restores an agent from a signed, escrowed continuity bundle. Generate the bundle first, then run the sandbox here.",
    ctaLabel: "Go to Bundle stage",
    targetTab: "bundle",
    targetElementId: "btn-package-bundle",
  },
  "select-successor-mode": {
    title: "Bundle required",
    message: "Successor governance applies to an escrowed continuity bundle. Generate the bundle first, then choose how the successor operates.",
    ctaLabel: "Go to Bundle stage",
    targetTab: "bundle",
    targetElementId: "btn-package-bundle",
  },
  "simulate-commercialization": {
    title: "Bundle required",
    message: "Commercialization licenses a sealed continuity bundle. Generate the bundle first, then simulate licensing here.",
    ctaLabel: "Go to Bundle stage",
    targetTab: "bundle",
    targetElementId: "btn-package-bundle",
  },
};
