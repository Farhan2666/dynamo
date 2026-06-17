"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LayoutSchema, CopyElement, ContextProfile, Section } from "@/types";

interface ExportPanelProps {
  layout: LayoutSchema;
  copy: CopyElement[];
  context: ContextProfile;
}

const SECTION_LABELS: Record<string, Record<string, string>> = {
  en: { features: "Features", testimonials: "Testimonials", pricing: "Pricing", faq: "FAQ", stats: "By the Numbers", logos: "Trusted By" },
  id: { features: "Fitur", testimonials: "Testimoni", pricing: "Harga", faq: "FAQ", stats: "Angka & Fakta", logos: "Dipercaya Oleh" },
};

function getSectionLabel(type: string, lang: string): string {
  const labels = SECTION_LABELS[lang] || SECTION_LABELS.en;
  return labels[type] || SECTION_LABELS.en[type] || type;
}

function heroHTML(s: Section, c: ContextProfile): string {
  const h = s.content;
  const imgHtml = h.image ? `<div style="margin-top:2rem;"><img src="${h.image}" alt="Hero" style="max-width:100%;border-radius:0.75rem;box-shadow:0 8px 32px rgba(0,0,0,0.15);" /></div>` : "";
  return `<section style="padding:6rem 1.5rem;background:linear-gradient(135deg,${c.primaryColor},${c.secondaryColor});color:white;text-align:center;">
  <div style="max-width:1100px;margin:0 auto;">
    ${h.badge ? `<span style="display:inline-block;padding:0.25rem 0.75rem;border-radius:999px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);font-size:0.875rem;margin-bottom:1.5rem;">${h.badge}</span>` : ""}
    <h1 style="font-size:3.5rem;font-weight:800;margin:0 0 1rem;line-height:1.15;">${h.headline}</h1>
    <p style="font-size:1.25rem;opacity:0.85;max-width:650px;margin:0 auto 2rem;">${h.subheadline}</p>
    <a href="#" style="display:inline-block;padding:0.875rem 2rem;border-radius:0.5rem;background:white;color:${c.primaryColor};font-weight:600;text-decoration:none;">${h.cta || "Get Started"}</a>
    ${imgHtml}
  </div>
</section>`;
}

function featuresHTML(s: Section, lang: string): string {
  const h = s.content;
  const label = getSectionLabel("features", lang);
  return `<section style="padding:5rem 1.5rem;background:#FFFFFF;">
  <div style="max-width:1100px;margin:0 auto;">
    <p style="text-align:center;font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${"#FF7E33"};margin-bottom:0.5rem;">${label}</p>
    <h2 style="text-align:center;font-size:2.25rem;font-weight:700;margin:0 0 0.75rem;">${h.title}</h2>
    <p style="text-align:center;color:#555570;max-width:600px;margin:0 auto 3rem;">${h.subtitle}</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;">
      ${[1, 2, 3].map((i) => `<div style="padding:2rem;border-radius:0.5rem;border:1px solid #E5E5F0;">
        <div style="width:3rem;height:3rem;border-radius:0.5rem;background:linear-gradient(135deg,${"#FF7E33"},purple);margin-bottom:1.25rem;"></div>
        <h3 style="font-size:1.125rem;font-weight:700;margin:0 0 0.75rem;">${h[`feature_${i}_title`]}</h3>
        <p style="font-size:0.9rem;color:#555570;line-height:1.6;margin:0;">${h[`feature_${i}_desc`]}</p>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function testimonialsHTML(s: Section, lang: string): string {
  const h = s.content;
  const label = getSectionLabel("testimonials", lang);
  return `<section style="padding:5rem 1.5rem;background:#F8F8FF;">
  <div style="max-width:900px;margin:0 auto;">
    <p style="text-align:center;font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${"#FF7E33"};margin-bottom:0.5rem;">${label}</p>
    <h2 style="text-align:center;font-size:2.25rem;font-weight:700;margin:0 0 3rem;">${h.title}</h2>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:2rem;">
      ${[1, 2].map((i) => `<div style="padding:2rem;border-radius:0.5rem;border:1px solid #E5E5F0;background:white;">
        <p style="font-size:0.95rem;color:#555570;line-height:1.7;margin:0 0 1.5rem;">&ldquo;${h[`quote_${i}`]}&rdquo;</p>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <div style="width:2.5rem;height:2.5rem;border-radius:999px;background:linear-gradient(135deg,${"#FF7E33"},${"#4A90D9"});display:flex;align-items:center;justify-content:center;color:white;font-weight:700;">${(h[`name_${i}`] || "?").charAt(0)}</div>
          <div><div style="font-weight:600;font-size:0.9rem;">${h[`name_${i}`]}</div><div style="font-size:0.8rem;color:#999;">${h[`role_${i}`]}${h[`company_${i}`] ? " &middot; " + h[`company_${i}`] : ""}</div></div>
        </div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function pricingHTML(s: Section, lang: string): string {
  const h = s.content;
  const label = getSectionLabel("pricing", lang);
  return `<section style="padding:5rem 1.5rem;background:#FFFFFF;">
  <div style="max-width:1000px;margin:0 auto;">
    <p style="text-align:center;font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${"#FF7E33"};margin-bottom:0.5rem;">${label}</p>
    <h2 style="text-align:center;font-size:2.25rem;font-weight:700;margin:0 0 3rem;">${h.title}</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;">
      ${[1, 2, 3].map((i) => `<div style="padding:2rem;border-radius:0.75rem;border:${i === 2 ? "2px solid " + "#FF7E33" : "1px solid #E5E5F0"};text-align:center;${i === 2 ? "transform:scale(1.05);box-shadow:0 8px 32px rgba(255,126,51,0.15);" : ""}background:white;">
        ${i === 2 ? '<div style="display:inline-block;padding:0.25rem 1rem;border-radius:999px;background:#FF7E33;color:white;font-size:0.75rem;font-weight:600;margin-bottom:1rem;">Most Popular</div>' : ""}
        <h3 style="font-size:1.125rem;font-weight:700;margin:0 0 0.25rem;">${h[`plan_${i}_name`]}</h3>
        <p style="font-size:0.85rem;color:#999;margin:0 0 1rem;">${h[`plan_${i}_desc`] || ""}</p>
        <div style="font-size:2.5rem;font-weight:800;margin-bottom:1.5rem;">${h[`plan_${i}_price`]}<span style="font-size:0.875rem;color:#999;font-weight:400;">/mo</span></div>
        <ul style="list-style:none;padding:0;margin:0 0 2rem;text-align:left;font-size:0.9rem;color:#555570;">
          ${[1, 2, 3, 4].map((f) => {
            const feat = h[`plan_${i}_feat_${f}`];
            return feat ? `<li style="padding:0.35rem 0;display:flex;align-items:center;gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 16 16" fill="#22c55e"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>${feat}</li>` : "";
          }).join("")}
        </ul>
        <a href="#" style="display:block;padding:0.75rem;border-radius:0.5rem;border:${i === 2 ? "none" : "1px solid #E5E5F0"};background:${i === 2 ? "#FF7E33" : "transparent"};color:${i === 2 ? "white" : "#1A1A2E"};font-weight:600;text-decoration:none;">${h[`plan_${i}_cta`] || "Choose Plan"}</a>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function ctaHTML(s: Section, c: ContextProfile): string {
  const h = s.content;
  return `<section style="padding:5rem 1.5rem;background:linear-gradient(135deg,${c.primaryColor},${c.secondaryColor});color:white;text-align:center;">
  <div style="max-width:700px;margin:0 auto;">
    <h2 style="font-size:2.25rem;font-weight:700;margin:0 0 1rem;">${h.headline}</h2>
    <p style="font-size:1.1rem;opacity:0.85;margin:0 0 2.5rem;">${h.subheadline}</p>
    <a href="#" style="display:inline-block;padding:0.875rem 2rem;border-radius:0.5rem;background:white;color:${c.primaryColor};font-weight:600;text-decoration:none;">${h.button || h.cta || "Get Started"}</a>
  </div>
</section>`;
}

function faqHTML(s: Section, lang: string): string {
  const h = s.content;
  const label = getSectionLabel("faq", lang);
  return `<section style="padding:5rem 1.5rem;background:#F8F8FF;">
  <div style="max-width:700px;margin:0 auto;">
    <p style="text-align:center;font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${"#FF7E33"};margin-bottom:0.5rem;">${label}</p>
    <h2 style="text-align:center;font-size:2.25rem;font-weight:700;margin:0 0 3rem;">${h.title}</h2>
    ${[1, 2, 3].map((i) => `<details style="border-bottom:1px solid #E5E5F0;padding:1rem 0;">
      <summary style="font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;">${h[`q_${i}`]}<span style="font-size:1.25rem;">+</span></summary>
      <p style="color:#555570;margin-top:0.75rem;">${h[`a_${i}`]}</p>
    </details>`).join("")}
  </div>
</section>`;
}

function statsHTML(s: Section): string {
  const h = s.content;
  return `<section style="padding:4rem 1.5rem;background:${"#1A1A2E"};color:white;">
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;max-width:800px;margin:0 auto;text-align:center;">
    ${[
      { v: h.stat_1_value, l: h.stat_1_label },
      { v: h.stat_2_value, l: h.stat_2_label },
      { v: h.stat_3_value, l: h.stat_3_label },
      { v: h.stat_4_value, l: h.stat_4_label },
    ].map((s) => `<div><div style="font-size:2.5rem;font-weight:800;margin-bottom:0.25rem;">${s.v}</div><div style="opacity:0.7;font-size:0.9rem;">${s.l}</div></div>`).join("")}
  </div>
</section>`;
}

function galleryHTML(s: Section): string {
  const h = s.content;
  const imgs = [1, 2, 3, 4, 5, 6].map((i) => {
    const url = h[`img_${i}`];
    return url
      ? `<div style="aspect-ratio:4/3;border-radius:0.5rem;overflow:hidden;"><img src="${url}" alt="Gallery ${i}" style="width:100%;height:100%;object-fit:cover;" /></div>`
      : `<div style="aspect-ratio:4/3;border-radius:0.5rem;background:linear-gradient(135deg,#E5E5F0,#F0F0FF);"></div>`;
  }).join("");
  return `<section style="padding:5rem 1.5rem;background:#FFFFFF;">
  <div style="max-width:1000px;margin:0 auto;">
    <h2 style="text-align:center;font-size:2.25rem;font-weight:700;margin:0 0 0.75rem;">${h.title}</h2>
    <p style="text-align:center;color:#555570;margin:0 0 2.5rem;">${h.subtitle}</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">
      ${imgs}
    </div>
  </div>
</section>`;
}

function logosHTML(s: Section): string {
  const h = s.content;
  return `<section style="padding:3rem 1.5rem;background:#F8F8FF;">
  <div style="max-width:900px;margin:0 auto;">
    <p style="text-align:center;font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin-bottom:2rem;">${h.title}</p>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:2rem;align-items:center;">
      ${[1, 2, 3, 4, 5, 6].map((i) => `<div style="text-align:center;opacity:0.4;font-weight:700;letter-spacing:0.05em;font-size:0.9rem;color:#1A1A2E;">${h[`logo_${i}`]}</div>`).join("")}
    </div>
  </div>
</section>`;
}

function contactHTML(s: Section): string {
  const h = s.content;
  return `<section style="padding:5rem 1.5rem;background:#FFFFFF;">
  <div style="max-width:700px;margin:0 auto;">
    <h2 style="text-align:center;font-size:2.25rem;font-weight:700;margin:0 0 0.75rem;">${h.title}</h2>
    <p style="text-align:center;color:#555570;margin:0 0 3rem;">${h.subtitle}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;">
      <div>
        <p><strong>Email:</strong> ${h.email}</p>
        <p><strong>Phone:</strong> ${h.phone}</p>
        <p><strong>Address:</strong> ${h.address}</p>
      </div>
      <div>
        <input placeholder="Name" style="width:100%;padding:0.75rem;border:1px solid #E5E5F0;border-radius:0.375rem;margin-bottom:0.75rem;" />
        <input placeholder="Email" style="width:100%;padding:0.75rem;border:1px solid #E5E5F0;border-radius:0.375rem;margin-bottom:0.75rem;" />
        <textarea placeholder="Message" rows="3" style="width:100%;padding:0.75rem;border:1px solid #E5E5F0;border-radius:0.375rem;margin-bottom:0.75rem;"></textarea>
        <button style="width:100%;padding:0.75rem;border:none;border-radius:0.375rem;background:${"#FF7E33"};color:white;font-weight:600;">${h.cta || "Send Message"}</button>
      </div>
    </div>
  </div>
</section>`;
}

function comparisonHTML(s: Section): string {
  const h = s.content;
  return `<section style="padding:5rem 1.5rem;background:#F8F8FF;">
  <div style="max-width:700px;margin:0 auto;">
    <h2 style="text-align:center;font-size:2.25rem;font-weight:700;margin:0 0 0.75rem;">${h.title}</h2>
    <p style="text-align:center;color:#555570;margin:0 0 2.5rem;">${h.subtitle}</p>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="border-bottom:1px solid #E5E5F0;"><th style="text-align:left;padding:0.75rem;font-size:0.9rem;">Feature</th><th style="padding:0.75rem;font-size:0.9rem;color:${"#FF7E33"};">Us</th><th style="padding:0.75rem;font-size:0.9rem;color:#999;">Others</th></tr></thead>
      <tbody>${[1, 2, 3, 4, 5, 6].map((i) => `<tr style="border-bottom:1px solid #E5E5F0;"><td style="padding:0.75rem;font-size:0.9rem;">${h[`row_${i}`]}</td><td style="padding:0.75rem;font-size:0.9rem;color:#22c55e;">${h[`our_val_${i}`]}</td><td style="padding:0.75rem;font-size:0.9rem;color:#999;">${h[`their_val_${i}`]}</td></tr>`).join("")}</tbody>
    </table>
  </div>
</section>`;
}

function timelineHTML(s: Section): string {
  const h = s.content;
  return `<section style="padding:5rem 1.5rem;background:#FFFFFF;">
  <div style="max-width:600px;margin:0 auto;">
    <h2 style="text-align:center;font-size:2.25rem;font-weight:700;margin:0 0 3rem;">${h.title}</h2>
    ${[1, 2, 3, 4, 5].map((i) => `<div style="padding-left:2rem;border-left:2px solid ${"#FF7E33"};padding-bottom:2rem;">
      <div style="font-size:0.85rem;font-weight:700;color:${"#FF7E33"};">${h[`year_${i}`]}</div>
      <h3 style="font-size:1.1rem;font-weight:700;margin:0.25rem 0;">${h[`event_${i}`]}</h3>
      <p style="color:#555570;font-size:0.9rem;margin:0;">${h[`desc_${i}`]}</p>
    </div>`).join("")}
  </div>
</section>`;
}

function teamHTML(s: Section): string {
  const h = s.content;
  return `<section style="padding:5rem 1.5rem;background:#F8F8FF;">
  <div style="max-width:900px;margin:0 auto;">
    <h2 style="text-align:center;font-size:2.25rem;font-weight:700;margin:0 0 0.75rem;">${h.title}</h2>
    <p style="text-align:center;color:#555570;margin:0 0 3rem;">${h.subtitle}</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;text-align:center;">
      ${[1, 2, 3, 4].map((i) => `<div>
        <div style="width:5rem;height:5rem;margin:0 auto 1rem;border-radius:999px;background:linear-gradient(135deg,${["#FF7E33","#4A90D9","#10b981","#f43f5e"][(i - 1) % 4]},${["purple","teal","green","rose"][(i - 1) % 4]});display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:1.5rem;">${(h[`name_${i}`] || "?").charAt(0)}</div>
        <h3 style="font-size:0.95rem;font-weight:700;margin:0;">${h[`name_${i}`]}</h3>
        <p style="font-size:0.85rem;color:#999;margin:0.25rem 0 0.5rem;">${h[`role_${i}`]}</p>
        <p style="font-size:0.85rem;color:#555570;">${h[`bio_${i}`]}</p>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function sectionToHTML(s: Section, c: ContextProfile): string {
  const lang = c.language || "en";
  switch (s.type) {
    case "hero": return heroHTML(s, c);
    case "features": return featuresHTML(s, lang);
    case "testimonials": return testimonialsHTML(s, lang);
    case "pricing": return pricingHTML(s, lang);
    case "cta": return ctaHTML(s, c);
    case "faq": return faqHTML(s, lang);
    case "stats": return statsHTML(s);
    case "gallery": return galleryHTML(s);
    case "logos": return logosHTML(s);
    case "contact": return contactHTML(s);
    case "comparison": return comparisonHTML(s);
    case "timeline": return timelineHTML(s);
    case "team": return teamHTML(s);
    default: return `<section style="padding:3rem 1.5rem;"><h2>${s.content.title || s.type}</h2></section>`;
  }
}

function generateSEOHead(context: ContextProfile, layout: LayoutSchema): string {
  const lang = context.language || "en";
  const hero = layout.sections.find((s) => s.type === "hero");
  const title = hero?.content?.headline || `${context.niche} — Landing Page`;
  const description = hero?.content?.subheadline || `Professional landing page for ${context.niche}`;
  const faqSection = layout.sections.find((s) => s.type === "faq");

  const ogTags = `
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="${lang === "id" ? "id_ID" : "en_US"}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">`;

  let jsonLd = "";
  if (faqSection) {
    const faqItems = [];
    for (let i = 1; i <= 3; i++) {
      const q = faqSection.content[`q_${i}`];
      const a = faqSection.content[`a_${i}`];
      if (q && a) faqItems.push({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } });
    }
    if (faqItems.length > 0) {
      jsonLd = `\n  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems })}</script>`;
    }
  }

  const orgLd = `\n  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: context.niche, description: description })}</script>`;

  return `  <meta name="description" content="${description}">
  <meta name="keywords" content="${context.industryTags.join(", ")}">
  <meta name="author" content="${context.niche}">${ogTags}${jsonLd}${orgLd}`;
}

function generateFullHTML(data: ExportPanelProps, darkMode: boolean = false): string {
  const { layout, context } = data;
  const lang = context.language || "en";
  const hero = layout.sections.find((s) => s.type === "hero");
  const title = hero?.content?.headline || `${context.niche} — Landing Page`;
  const sectionsHTML = layout.sections.map((s) => sectionToHTML(s, context)).join("\n");

  const seoHead = generateSEOHead(context, layout);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Dynamo Generated</title>
${seoHead}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; color: ${darkMode ? "#E5E5F0" : "#1A1A2E"}; background: ${darkMode ? "#0F0F1A" : "#FFFFFF"}; line-height: 1.6; }
    h1, h2, h3, h4 { font-family: 'Sora', sans-serif; }
    a { transition: all 0.2s; }
    a:hover { opacity: 0.85; }
    section { ${darkMode ? "filter: brightness(0.85) contrast(1.1);" : ""} }
    @media (max-width: 768px) {
      [style*="grid-template-columns:repeat(3"] { grid-template-columns: 1fr !important; }
      [style*="grid-template-columns:repeat(2"] { grid-template-columns: 1fr !important; }
      [style*="grid-template-columns:repeat(4"] { grid-template-columns: repeat(2,1fr) !important; }
      [style*="grid-template-columns:repeat(6"] { grid-template-columns: repeat(2,1fr) !important; }
    }
  </style>
</head>
<body>
${sectionsHTML}
</body>
</html>`;
}

function generateTailwind(data: ExportPanelProps): string {
  const { layout, context } = data;
  const sections = layout.sections.map((s) => {
    const h = s.content;
    const bg = s.type === "hero" || s.type === "cta"
      ? `style={{ background: 'linear-gradient(135deg, ${context.primaryColor}, ${context.secondaryColor})' }}`
      : s.type === "stats"
      ? `style={{ background: '${context.primaryColor}' }}`
      : "";
    return `<section className="${s.twClasses.join(" ")}" ${bg}>
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="font-heading text-heading font-bold">${h.title || s.type}</h2>
    <p className="text-body text-text-secondary">${h.subtitle || ""}</p>
  </div>
</section>`;
  }).join("\n\n");

  return `{/* Dynamo Generated — ${context.niche} for ${context.audiencePersona} */}\n{/* Colors: ${context.primaryColor} / ${context.secondaryColor} */}\n\n${sections}`;
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportPanel({ layout, copy, context }: ExportPanelProps) {
  const [mode, setMode] = useState<"html" | "tailwind">("html");
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const getContent = useCallback((): string => {
    return mode === "html"
      ? generateFullHTML({ layout, copy, context }, darkMode)
      : generateTailwind({ layout, copy, context });
  }, [layout, copy, context, mode, darkMode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getContent());
    } catch {
      const ta = document.createElement("textarea");
      ta.value = getContent();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = mode === "html" ? "html" : "tsx";
    const mime = mode === "html" ? "text/html" : "text/plain";
    downloadFile(getContent(), `${context.niche.replace(/\s+/g, "-").toLowerCase()}.${ext}`, mime);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 bg-surface-secondary rounded-soft p-0.5 border border-surface-tertiary">
        {(["html", "tailwind"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 px-3 py-1.5 text-caption font-medium rounded-soft transition-all ${
              mode === m
                ? "bg-white text-text-primary shadow-soft"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {m === "html" ? "HTML" : "Tailwind React"}
          </button>
        ))}
      </div>

      {mode === "html" && (
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] text-text-muted font-medium">Dark Mode Export</label>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative w-8 h-4 rounded-full transition-colors ${darkMode ? "bg-brand-primary" : "bg-surface-tertiary"}`}
          >
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${darkMode ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
      )}

      <div className="relative">
        <pre className="p-3 rounded-soft bg-brand-dark text-[10px] text-white/80 font-mono overflow-x-auto max-h-40 scrollbar-thin">
          {getContent().slice(0, 600)}
          {getContent().length > 600 && <span className="text-white/40">...</span>}
        </pre>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="py-2 rounded-soft bg-brand-primary text-white text-caption font-medium hover:opacity-90 transition-opacity"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span key="copied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Copied! ✓</motion.span>
            ) : (
              <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Copy</motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
          className="py-2 rounded-soft border border-surface-tertiary text-caption font-medium text-text-secondary hover:bg-surface-tertiary transition-colors"
        >
          Download
        </motion.button>
      </div>
    </div>
  );
}
