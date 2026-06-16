"use client";

import type { Section, CopyElement } from "@/types";

export function mergeCopyIntoSections(
  sections: Section[],
  copy: CopyElement[]
): Section[] {
  const headline = copy.find((c) => c.type === "headline")?.content || "";
  const subheader = copy.find((c) => c.type === "subheader")?.content || "";
  const cta = copy.find((c) => c.type === "cta")?.content || "";
  const benefit = copy.find((c) => c.type === "benefit")?.content || "";

  return sections.map((section) => {
    switch (section.type) {
      case "hero":
        return {
          ...section,
          content: {
            ...section.content,
            headline: section.content.headline || headline,
            subheadline: section.content.subheadline || subheader,
            cta: section.content.cta || cta,
          },
        };
      case "features":
        return {
          ...section,
          content: {
            ...section.content,
            title: section.content.title || "Key Features",
            subtitle:
              section.content.subtitle ||
              benefit ||
              "Everything you need to succeed",
          },
        };
      case "testimonials":
        return {
          ...section,
          content: {
            ...section.content,
            title: section.content.title || "What People Say",
            subtitle: section.content.subtitle || subheader,
            quote:
              section.content.quote ||
              `"${headline}" — trusted by teams everywhere.`,
          },
        };
      case "cta":
        return {
          ...section,
          content: {
            ...section.content,
            headline: section.content.headline || headline,
            button: section.content.button || cta,
          },
        };
      case "pricing":
        return {
          ...section,
          content: {
            ...section.content,
            title: section.content.title || "Simple Pricing",
            subtitle: section.content.subtitle || subheader,
          },
        };
      case "faq":
        return {
          ...section,
          content: {
            ...section.content,
            title: section.content.title || "Frequently Asked",
            subtitle: section.content.subtitle || subheader,
          },
        };
      case "stats":
        return {
          ...section,
          content: {
            ...section.content,
            title: section.content.title || headline,
          },
        };
      default:
        return {
          ...section,
          content: {
            ...section.content,
            title: section.content.title || section.type,
            subtitle: section.content.subtitle || subheader,
          },
        };
    }
  });
}

export function generateLayoutHTML(
  sections: Section[],
  primaryColor: string,
  secondaryColor: string
): string {
  const sectionHTML = sections
    .map((s) => {
      const bg =
        s.type === "hero"
          ? `background:linear-gradient(135deg,${primaryColor},${secondaryColor});color:white;`
          : s.type === "cta"
          ? `background:linear-gradient(135deg,${primaryColor},${secondaryColor});color:white;`
          : "";
      return `<section style="padding:4rem 1.5rem;${bg}">
    <div style="max-width:1200px;margin:0 auto;">
      <h2 style="font-size:2rem;font-weight:700;margin-bottom:0.5rem;">${s.content.title || s.type}</h2>
      <p style="color:#666;">${s.content.subtitle || ""}</p>
    </div>
  </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Page</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; color: #1A1A2E; }
  </style>
</head>
<body>${sectionHTML}</body>
</html>`;
}
