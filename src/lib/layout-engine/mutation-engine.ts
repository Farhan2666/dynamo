"use client";

import type { LayoutSchema, Section, MutationOptions } from "@/types";
import { mutateSection } from "@/lib/layout-engine/patterns";

const history: LayoutSchema[] = [];

export function trackMutation(schema: LayoutSchema): void {
  history.push(schema);
  if (history.length > 8) history.shift();
}

function calculateSimilarity(a: Section[], b: Section[]): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;
  const typeMatches = a.filter((s, i) => s.type === b[i]?.type).length;
  const orderScore = typeMatches / maxLen;
  const spacingMatches = a.filter((s, i) => s.spacing === b[i]?.spacing).length;
  const spacingScore = spacingMatches / maxLen;
  return orderScore * 0.6 + spacingScore * 0.4;
}

export function regenerateLayout(
  current: LayoutSchema,
  options: MutationOptions
): LayoutSchema {
  const mutatedSections = current.sections.map((s) =>
    mutateSection(s, options.strength)
  );

  const newSchema: LayoutSchema = {
    ...current,
    sections: mutatedSections,
  };

  const maxSimilarity = history.length > 0
    ? Math.max(...history.map((h) => calculateSimilarity(newSchema.sections, h.sections)))
    : 0;

  if (maxSimilarity > 0.6) {
    const reordered = [...mutatedSections].sort(() => Math.random() - 0.5);
    newSchema.sections = reordered.map((s, i) => ({ ...s, order: i + 1 }));
  }

  trackMutation(newSchema);
  return newSchema;
}

export function getMutationHistorySize(): number {
  return history.length;
}
