"use client";

import { useState } from "react";
import { useGenerationStore, useUIStore } from "@/lib/store";
import { Button } from "@/components/ui";
import type { Section, MutationOptions } from "@/types";
import { regenerateLayout } from "@/lib/layout-engine/mutation-engine";

const DEVICE_SIZES = [
  { id: "mobile", width: 375, label: "Mobile", icon: "📱" },
  { id: "tablet", width: 768, label: "Tablet", icon: "📟" },
  { id: "desktop", width: 1280, label: "Desktop", icon: "💻" },
];

const MUTATION_MODES = [
  { id: "professional", label: "More Professional", desc: "+15% whitespace, refined typography" },
  { id: "playful", label: "More Playful", desc: "Adds micro-interactions & color" },
  { id: "surprise", label: "Surprise Me", desc: "Randomizes 3 non-critical elements" },
];

function SectionPreview({ section, index }: { section: Section; index: number }) {
  const styleVariant = (section.spacing === "compact" ? 0 : section.spacing === "breathing" ? 2 : 1);

  const bgVariants: Record<string, string[]> = {
    hero: ["from-brand-dark to-brand-dark-light text-white", "bg-surface text-text-primary blob-bg", "gradient-brand text-white"],
    features: ["bg-surface dot-grid", "bg-surface-secondary", "bg-white"],
    testimonials: ["bg-surface-secondary", "bg-surface dot-grid", "bg-brand-dark text-white"],
    pricing: ["bg-surface dot-grid", "bg-surface-secondary", "bg-gradient-to-b from-surface to-surface-secondary"],
    cta: ["gradient-brand text-white", "bg-brand-dark text-white", "bg-surface text-text-primary border-t border-surface-tertiary"],
    faq: ["bg-surface-secondary", "bg-surface dot-grid", "bg-white"],
    stats: ["bg-brand-dark text-white dot-grid-white", "gradient-brand text-white", "bg-surface border-b border-surface-tertiary"],
    gallery: ["bg-surface dot-grid", "bg-surface-secondary", "bg-brand-dark text-white"],
    logos: ["bg-surface-secondary", "bg-surface dot-grid", "bg-white"],
    contact: ["bg-surface dot-grid", "bg-surface-secondary", "bg-brand-dark text-white"],
    comparison: ["bg-surface-secondary", "bg-surface dot-grid", "bg-white"],
    timeline: ["bg-surface dot-grid", "bg-surface-secondary", "bg-brand-dark text-white"],
    team: ["bg-surface-secondary", "bg-surface dot-grid", "bg-white"],
  };

  const getBg = () => {
    const options = bgVariants[section.type];
    if (!options) return "bg-surface";
    return options[styleVariant % options.length];
  };

  return (
    <div
      className={`relative group transition-all duration-[var(--transition-base)] ${section.twClasses.join(" ")} ${getBg()}`}
    >
      {section.type === "hero" && (
        <div className="noise-bg absolute inset-0 pointer-events-none opacity-30" />
      )}
      {section.type === "cta" && (
        <div className="noise-bg absolute inset-0 pointer-events-none opacity-20" />
      )}
      <div className="relative max-w-6xl mx-auto px-6">
        <SectionRenderer section={section} index={index} />
      </div>
    </div>
  );
}

function StarRating() {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="14" height="14" viewBox="0 0 16 16" fill="#FF7E33">
          <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 10.25l-3.52 1.85.67-3.93L2.3 5.64l3.94-.57L8 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function SectionRenderer({ section }: { section: Section; index: number }) {
  const { type, content } = section;

  switch (type) {
    case "hero":
      return (
        <div className="flex flex-col items-center text-center py-16 md:py-28">
          {content.badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-caption font-medium mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-soft" />
              {content.badge}
            </span>
          )}
          <h1 className="font-heading text-display font-bold mb-5 max-w-4xl leading-tight">
            {content.headline}
          </h1>
          <p className="text-body-lg opacity-80 max-w-2xl mb-10 leading-relaxed">
            {content.subheadline}
          </p>
          <div className="flex items-center gap-4">
            <Button variant="primary" size="lg">
              {content.cta}
            </Button>
            <Button variant="ghost" size="lg">
              Learn More →
            </Button>
          </div>
        </div>
      );

    case "features":
      return (
        <div className="py-16 md:py-20">
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">
              Features
            </span>
            <h2 className="font-heading text-heading font-bold mb-3">{content.title}</h2>
            <p className="text-body-lg text-text-secondary max-w-xl mx-auto">{content.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => {
              const iconPaths = [
                "M13 10V3L4 14h7l-3 7 9-11h-7l3-7z",
                "M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
                "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
                "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
              ];
              const colors = ["from-brand-primary to-purple-500", "from-brand-secondary to-teal-500", "from-brand-accent to-orange-500"];
              return (
                <div
                  key={i}
                  className="group p-8 rounded-medium bg-surface border border-surface-tertiary shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-[var(--transition-base)]"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[(i - 1) % colors.length]} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-[var(--transition-base)]`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={iconPaths[(i - 1) % iconPaths.length]} />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-3">
                    {content[`feature_${i}_title`]}
                  </h3>
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    {content[`feature_${i}_desc`]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      );

    case "testimonials":
      return (
        <div className="py-16 md:py-20">
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">
              Testimonials
            </span>
            <h2 className="font-heading text-heading font-bold mb-3">{content.title}</h2>
            <p className="text-body-lg text-text-secondary max-w-xl mx-auto">{content.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2].map((i) => (
              <div key={i} className="p-8 rounded-medium bg-surface border border-surface-tertiary shadow-soft relative">
                <svg className="absolute top-4 left-4 w-8 h-8 text-brand-primary/10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </svg>
                <div className="relative">
                  <StarRating />
                  <p className="text-body text-text-secondary mt-4 mb-6 leading-relaxed">&ldquo;{content[`quote_${i}`]}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-body-sm">
                      {(content[`name_${i}`] || "?").charAt(0)}
                    </div>
                    <div>
                      <div className="text-body-sm font-medium">{content[`name_${i}`]}</div>
                      <div className="text-caption text-text-muted">{content[`role_${i}`]}{content[`company_${i}`] ? ` · ${content[`company_${i}`]}` : ""}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="py-16 md:py-24 text-center relative overflow-hidden">
          <div className="relative">
            <h2 className="font-heading text-heading font-bold mb-4">{content.headline}</h2>
            <p className="text-body-lg opacity-80 mb-10 max-w-xl mx-auto">{content.subheadline}</p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="primary" size="lg">
                {content.button || content.cta}
              </Button>
              <Button variant="ghost" size="lg">Learn More →</Button>
            </div>
          </div>
        </div>
      );

    case "pricing":
      return (
        <div className="py-16 md:py-20">
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">
              Pricing
            </span>
            <h2 className="font-heading text-heading font-bold mb-3">{content.title}</h2>
            <p className="text-body-lg text-text-secondary max-w-xl mx-auto">{content.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => {
              const name = content[`plan_${i}_name`];
              const price = content[`plan_${i}_price`];
              const cta = content[`plan_${i}_cta`] || "Choose Plan";
              const isPopular = i === 2;
              return (
                <div
                  key={name}
                  className={`relative p-8 rounded-medium bg-surface border text-center transition-all duration-[var(--transition-base)] ${
                    isPopular
                      ? "border-brand-primary shadow-glow scale-105"
                      : "border-surface-tertiary shadow-soft hover:shadow-medium"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-primary text-white text-caption font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  <h3 className="font-heading font-bold text-lg mb-1">{name}</h3>
                  <p className="text-caption text-text-muted mb-4">{content[`plan_${i}_desc`]}</p>
                  <div className="font-heading font-bold text-display mb-1">{price}</div>
                  <p className="text-caption text-text-muted mb-6">per month</p>
                  <ul className="text-body-sm text-text-secondary space-y-3 mb-8 text-left">
                    {[1, 2, 3, 4]
                      .map((f) => content[`plan_${i}_feat_${f}`])
                      .filter(Boolean)
                      .map((feat) => (
                        <li key={feat} className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                          </svg>
                          {feat}
                        </li>
                      ))}
                  </ul>
                  <Button variant={isPopular ? "primary" : "outline"} className="w-full">{cta}</Button>
                </div>
              );
            })}
          </div>
        </div>
      );

    case "faq":
      return (
        <div className="py-16 md:py-20 max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">
              FAQ
            </span>
            <h2 className="font-heading text-heading font-bold mb-3">{content.title}</h2>
            <p className="text-body-lg text-text-secondary">{content.subtitle}</p>
          </div>
          <div className="space-y-0">
            {[1, 2, 3].map((i) => (
              <details key={i} className="group border-b border-surface-tertiary last:border-b-0">
                <summary className="flex items-center justify-between cursor-pointer py-5 text-body font-medium hover:text-brand-primary transition-colors list-none">
                  {content[`q_${i}`]}
                  <svg className="w-4 h-4 shrink-0 ml-4 transition-transform duration-[var(--transition-base)] group-open:rotate-180 text-text-muted" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <p className="text-body-sm text-text-secondary pb-5 leading-relaxed">{content[`a_${i}`]}</p>
              </details>
            ))}
          </div>
        </div>
      );

    case "stats":
      return (
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: content.stat_1_value, label: content.stat_1_label },
              { value: content.stat_2_value, label: content.stat_2_label },
              { value: content.stat_3_value, label: content.stat_3_label },
              { value: content.stat_4_value, label: content.stat_4_label },
            ].map((stat) => (
              <div key={stat.label} className="group">
                <div className="font-heading font-bold text-display mb-1 group-hover:scale-105 transition-transform">{stat.value}</div>
                <div className="text-body-sm opacity-70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case "gallery":
      return (
        <div className="py-16 md:py-20">
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">
              Portfolio
            </span>
            <h2 className="font-heading text-heading font-bold mb-3">{content.title}</h2>
            <p className="text-body-lg text-text-secondary max-w-xl mx-auto">{content.subtitle}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {["All", content.category_1, content.category_2, content.category_3, content.category_4].filter(Boolean).map((cat) => (
              <button key={cat} className={`px-4 py-1.5 rounded-full text-caption font-medium transition-all ${cat === "All" ? "bg-brand-primary text-white" : "bg-surface border border-surface-tertiary text-text-secondary hover:border-brand-primary"}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-medium bg-gradient-to-br from-surface-tertiary to-surface-secondary overflow-hidden group cursor-pointer relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-caption font-medium">{content[`tag_${((i - 1) % 6) + 1}`] || "Project"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "logos":
      return (
        <div className="py-14 md:py-18">
          <p className="text-center text-caption font-semibold text-text-muted tracking-widest uppercase mb-10">{content.title}</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 max-w-4xl mx-auto items-center">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center justify-center">
                <div className="h-8 w-full rounded bg-gradient-to-r from-surface-tertiary to-surface-secondary flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity">
                  <span className="text-caption font-bold text-text-muted tracking-wider">{content[`logo_${i}`]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "contact":
      return (
        <div className="py-16 md:py-20">
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">
              Contact
            </span>
            <h2 className="font-heading text-heading font-bold mb-3">{content.title}</h2>
            <p className="text-body-lg text-text-secondary max-w-xl mx-auto">{content.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 max-w-3xl mx-auto">
            <div className="space-y-6">
              {[
                { label: "Email", value: content.email, icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                { label: "Phone", value: content.phone, icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
                { label: "Address", value: content.address, icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
                { label: "Hours", value: content.hours, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <div>
                    <div className="text-caption font-medium text-text-muted">{item.label}</div>
                    <div className="text-body-sm">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <input placeholder="Your Name" className="w-full px-4 py-3 rounded-soft border border-surface-tertiary text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary bg-surface" />
              <input placeholder="Your Email" className="w-full px-4 py-3 rounded-soft border border-surface-tertiary text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary bg-surface" />
              <textarea placeholder="Message" rows={3} className="w-full px-4 py-3 rounded-soft border border-surface-tertiary text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary bg-surface resize-none" />
              <Button variant="primary" className="w-full">{content.cta}</Button>
            </div>
          </div>
        </div>
      );

    case "comparison":
      return (
        <div className="py-16 md:py-20">
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">
              Comparison
            </span>
            <h2 className="font-heading text-heading font-bold mb-3">{content.title}</h2>
            <p className="text-body-lg text-text-secondary max-w-xl mx-auto">{content.subtitle}</p>
          </div>
          <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-tertiary">
                  <th className="py-4 pr-4 text-body-sm font-semibold">Feature</th>
                  <th className="py-4 px-4 text-body-sm font-semibold text-brand-primary">Us</th>
                  <th className="py-4 pl-4 text-body-sm font-semibold text-text-muted">Others</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i} className="border-b border-surface-tertiary/50">
                    <td className="py-3.5 pr-4 text-body-sm font-medium">{content[`row_${i}`]}</td>
                    <td className="py-3.5 px-4 text-body-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                        </svg>
                        {content[`our_val_${i}`]}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-body-sm text-text-muted">{content[`their_val_${i}`]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case "timeline":
      return (
        <div className="py-16 md:py-20">
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">
              Timeline
            </span>
            <h2 className="font-heading text-heading font-bold mb-3">{content.title}</h2>
            <p className="text-body-lg text-text-secondary max-w-xl mx-auto">{content.subtitle}</p>
          </div>
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-brand-primary via-brand-secondary to-transparent" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="relative pl-16 pb-10 last:pb-0">
                <div className="absolute left-[1.35rem] w-3 h-3 rounded-full bg-brand-primary border-2 border-surface -translate-x-1/2 mt-1.5 z-10" />
                <div className="text-caption font-bold text-brand-primary mb-1">{content[`year_${i}`]}</div>
                <h3 className="font-heading font-bold text-base mb-1">{content[`event_${i}`]}</h3>
                <p className="text-body-sm text-text-secondary">{content[`desc_${i}`]}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "team":
      return (
        <div className="py-16 md:py-20">
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">
              Team
            </span>
            <h2 className="font-heading text-heading font-bold mb-3">{content.title}</h2>
            <p className="text-body-lg text-text-secondary max-w-xl mx-auto">{content.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((i) => {
              const colors = ["from-brand-primary to-purple-500", "from-brand-secondary to-teal-500", "from-brand-accent to-orange-500", "from-pink-500 to-rose-500"];
              return (
                <div key={i} className="text-center group">
                  <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${colors[(i - 1) % colors.length]} flex items-center justify-center text-white font-heading font-bold text-2xl group-hover:scale-105 transition-transform`}>
                    {(content[`name_${i}`] || "?").charAt(0)}
                  </div>
                  <h3 className="font-heading font-bold text-sm mb-0.5">{content[`name_${i}`]}</h3>
                  <p className="text-caption text-text-muted mb-2">{content[`role_${i}`]}</p>
                  <p className="text-caption text-text-secondary leading-relaxed max-w-[200px] mx-auto">{content[`bio_${i}`]}</p>
                </div>
              );
            })}
          </div>
        </div>
      );

    default:
      return (
        <div className="py-16 text-center">
          <h2 className="font-heading text-heading-sm font-bold mb-2">{content.title}</h2>
          <p className="text-body text-text-secondary">{content.subtitle}</p>
        </div>
      );
  }
}

export function PreviewPageClient() {
  const { layoutSchema, addMutation } = useGenerationStore();
  const { addToast } = useUIStore();
  const [device, setDevice] = useState("desktop");
  const [mutationStrength, setMutationStrength] = useState(3);
  const [showMutationPanel, setShowMutationPanel] = useState(false);

  const currentDevice = DEVICE_SIZES.find((d) => d.id === device) || DEVICE_SIZES[2];

  const handleRegenerate = async (mode: string) => {
    if (!layoutSchema) return;
    addToast(`Regenerating with "${mode}" mode...`, "info");
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
    const options: MutationOptions = {
      preserveNiche: true,
      preserveColors: mode === "professional",
      strength: (mode === "surprise" ? mutationStrength : Math.max(2, mutationStrength - 1)) as 1 | 2 | 3 | 4 | 5,
      mode: mode as "professional" | "playful" | "surprise",
    };
    const mutated = regenerateLayout(layoutSchema, options);
    addMutation(mutated);
    useGenerationStore.getState().setLayoutSchema(mutated);
    addToast("Layout regenerated!", "success");
  };

  if (!layoutSchema) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="text-caption text-text-muted mb-2">No layout generated yet</div>
          <p className="text-body text-text-secondary mb-4">Go back and create a page first.</p>
          <a href="/create" className="text-brand-primary font-medium hover:underline">Create Page →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 h-12 border-b border-surface-tertiary bg-surface-secondary/50">
          <div className="flex items-center gap-1 bg-surface rounded-soft border border-surface-tertiary p-0.5">
            {DEVICE_SIZES.map((d) => (
              <button
                key={d.id}
                onClick={() => setDevice(d.id)}
                className={`px-3 py-1 text-caption font-medium rounded-soft transition-all ${
                  device === d.id
                    ? "bg-white shadow-soft text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {d.icon} {d.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              WCAG AA ✓
            </span>
            <button
              onClick={() => setShowMutationPanel(!showMutationPanel)}
              className="px-3 py-1.5 rounded-soft border border-surface-tertiary text-caption font-medium text-text-secondary hover:bg-surface-tertiary transition-colors"
            >
              Mutation Panel
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F0F0F5]">
          <div
            className="mx-auto bg-white shadow-strong min-h-full transition-all duration-[var(--transition-base)]"
            style={{ maxWidth: currentDevice.width }}
          >
            {layoutSchema.sections.map((section, idx) => (
              <SectionPreview key={section.id} section={section} index={idx} />
            ))}
          </div>
        </div>
      </div>

      {showMutationPanel && (
        <div className="w-72 border-l border-surface-tertiary bg-surface overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="font-heading font-bold text-base mb-1">Mutation Engine</h3>
            <p className="text-caption text-text-muted mb-4">Adjust how your page looks.</p>
          </div>

          <div>
            <label className="text-caption font-medium text-text-muted mb-2 block">
              Mutation Strength: {mutationStrength}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={mutationStrength}
              onChange={(e) => setMutationStrength(Number(e.target.value))}
              className="w-full accent-brand-primary"
            />
            <div className="flex justify-between text-caption text-text-muted mt-1">
              <span>Subtle</span>
              <span>Extreme</span>
            </div>
          </div>

          <div className="space-y-2">
            {MUTATION_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleRegenerate(mode.id)}
                className="w-full text-left p-3 rounded-soft border border-surface-tertiary hover:border-brand-primary hover:bg-brand-primary/5 transition-all"
              >
                <div className="text-body-sm font-medium">{mode.label}</div>
                <div className="text-caption text-text-muted">{mode.desc}</div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-surface-tertiary">
            <Button variant="primary" className="w-full" onClick={() => handleRegenerate("surprise")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Regenerate
            </Button>
          </div>

          <div className="pt-4 space-y-2">
            <Button variant="secondary" className="w-full" size="sm">
              Export HTML
            </Button>
            <Button variant="ghost" className="w-full" size="sm">
              Export PNG
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
