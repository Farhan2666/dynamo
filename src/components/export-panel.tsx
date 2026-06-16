"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LayoutSchema, CopyElement, ContextProfile } from "@/types";

interface ExportPanelProps {
  layout: LayoutSchema;
  copy: CopyElement[];
  context: ContextProfile;
}

function generateHTML(data: ExportPanelProps): string {
  const { layout, copy, context } = data;
  const primary = context.primaryColor;

  const sectionsHTML = layout.sections
    .map((s) => {
      const sectionCopy = copy.find((c) => c.type === "headline");
      return `
    <section class="section-${s.type}" style="padding: ${
        s.spacing === "compact" ? "2rem" : s.spacing === "comfortable" ? "3rem" : "5rem"
      } 1rem;">
      <div class="container" style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-family: 'Sora', sans-serif; font-size: 2rem; color: ${primary};">
          ${sectionCopy?.content || s.type.charAt(0).toUpperCase() + s.type.slice(1)}
        </h2>
        <p style="color: #555570; line-height: 1.6;">
          Content for ${s.type} section.
        </p>
      </div>
    </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${context.niche} — Dynamo Generated</title>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      color: #1A1A2E;
      background: #FFFFFF;
      line-height: 1.6;
    }
    h1, h2, h3, h4 { font-family: 'Sora', sans-serif; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
  </style>
</head>
<body>
${sectionsHTML}
</body>
</html>`;
}

export function ExportPanel({ layout, copy, context }: ExportPanelProps) {
  const [mode, setMode] = useState<"html" | "css" | "tailwind">("html");
  const [copied, setCopied] = useState(false);

  const getExportContent = (): string => {
    switch (mode) {
      case "html":
        return generateHTML({ layout, copy, context });
      case "css": {
        return `/* Dynamo Generated — ${context.niche} */
:root {
  --primary: ${context.primaryColor};
  --secondary: ${context.secondaryColor};
  --accent: ${context.primaryColor};
  --dark: #1A1A2E;
  --light: #F5F5FF;
}

.hero { padding: 5rem 1rem; text-align: center; }
.features { padding: 4rem 1rem; }
.testimonials { padding: 3rem 1rem; }
.cta { padding: 4rem 1rem; text-align: center; }

@media (min-width: 768px) {
  .hero { padding: 8rem 2rem; }
  .features { padding: 6rem 2rem; }
}`;
      }
      case "tailwind": {
        const sections = layout.sections.map((s) => `  <!-- ${s.type} section (spacing: ${s.spacing}) -->
  <section className="${s.twClasses.join(" ")}">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="font-heading text-heading-sm font-bold text-[${context.primaryColor}]">
        ${s.type.charAt(0).toUpperCase() + s.type.slice(1)}
      </h2>
    </div>
  </section>`);
        return `{/* Dynamo Generated — ${context.niche} */}\n/* Animations: ${layout.animations.type} (intensity: ${layout.animations.intensity}) */\n${sections.join("\n\n")}`;
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getExportContent());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = getExportContent();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 bg-surface-secondary rounded-soft p-0.5 border border-surface-tertiary">
        {(["html", "css", "tailwind"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 px-3 py-1.5 text-caption font-medium rounded-soft transition-all ${
              mode === m
                ? "bg-white text-text-primary shadow-soft"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {m === "html" ? "HTML" : m === "css" ? "CSS" : "Tailwind"}
          </button>
        ))}
      </div>

      <div className="relative">
        <pre className="p-3 rounded-soft bg-brand-dark text-[10px] text-white/80 font-mono overflow-x-auto max-h-48 scrollbar-thin">
          {getExportContent().slice(0, 800)}
          {getExportContent().length > 800 && (
            <span className="text-white/40">...</span>
          )}
        </pre>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleCopy}
        className="w-full py-2 rounded-soft bg-brand-primary text-white text-caption font-medium hover:bg-[var(--brand-primary-dark)] transition-colors"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="copied"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              Copied! ✓
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              Copy to Clipboard
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
