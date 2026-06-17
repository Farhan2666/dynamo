"use client";

import { useEffect } from "react";
import { useGenerationStore } from "@/lib/store";
import type { Section } from "@/types";
import { ReadingProgressBar, BackToTopButton, FloatingCTABar, StaggeredSection } from "@/components/page-enhancements";

const BG_VARIANTS: Record<string, string> = {
  hero: "from-brand-dark to-brand-dark-light text-white",
  features: "bg-surface",
  testimonials: "bg-surface-secondary",
  pricing: "bg-surface",
  cta: "gradient-brand text-white",
  faq: "bg-surface-secondary",
  stats: "bg-brand-dark text-white",
};

function RenderSection({ section }: { section: Section }) {
  const { type, content } = section;
  const bg = BG_VARIANTS[type] || "bg-surface";

  switch (type) {
    case "hero":
      return (
        <section className={`${bg} py-20 md:py-32`}>
          <div className="max-w-6xl mx-auto px-6 text-center">
            {content.badge && (
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-body-sm font-medium mb-6">
                {content.badge}
              </span>
            )}
            <h1 className="font-heading text-display font-bold mb-4 max-w-3xl mx-auto">
              {content.headline || "Headline"}
            </h1>
            <p className="text-body-lg opacity-80 max-w-xl mx-auto mb-8">
              {content.subheadline || ""}
            </p>
            <a
              href="#cta"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-soft bg-white text-brand-dark font-semibold hover:opacity-90 transition-all"
            >
              {content.cta || "Get Started"}
            </a>
          </div>
        </section>
      );
    case "features":
      return (
        <section className={bg + " py-16 md:py-24"}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-heading text-heading font-bold mb-3">{content.title}</h2>
              <p className="text-body-lg text-text-secondary">{content.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-medium bg-white border border-gray-100 shadow-soft">
                  <div className="w-10 h-10 rounded-lg gradient-brand mb-4" />
                  <h3 className="font-heading font-bold text-lg mb-2">
                    {content[`feature_${i}_title`] || `Feature ${i}`}
                  </h3>
                  <p className="text-body-sm text-text-secondary">
                    {content[`feature_${i}_desc`] || "Description of this feature."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case "testimonials":
      return (
        <section className={bg + " py-12 md:py-20"}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-heading text-heading font-bold mb-3">{content.title}</h2>
              <p className="text-body-lg text-text-secondary">{content.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[1, 2].map((i) => (
                <div key={i} className="p-6 rounded-medium bg-white border border-gray-100">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} width="16" height="16" viewBox="0 0 16 16" fill="#FF7E33">
                        <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 10.25l-3.52 1.85.67-3.93L2.3 5.64l3.94-.57L8 1.5z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-body text-text-secondary mb-4">
                    &ldquo;{content[`quote_${i}`] || content.quote || "Excellent!"}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div>
                      <div className="text-body-sm font-medium">{content[`name_${i}`] || "Customer"}</div>
                      <div className="text-caption text-text-muted">{content[`role_${i}`] || "Verified"}{content[`company_${i}`] ? ` · ${content[`company_${i}`]}` : ""}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case "cta":
      return (
        <section id="cta" className="gradient-brand text-white py-16 md:py-20 text-center">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-heading text-heading font-bold mb-4">{content.headline || "Ready?"}</h2>
            <p className="text-body-lg opacity-80 mb-8 max-w-lg mx-auto">{content.subheadline || ""}</p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-soft bg-white text-brand-primary font-semibold hover:opacity-90 transition-all"
              >
                {content.button || content.cta || "Get Started"}
              </a>
            </div>
          </div>
        </section>
      );
    case "pricing":
      return (
        <section className={bg + " py-16 md:py-24"}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-heading text-heading font-bold mb-3">{content.title}</h2>
              <p className="text-body-lg text-text-secondary">{content.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[1, 2, 3].map((pi) => (
                <div key={pi} className="p-6 rounded-medium bg-white border border-gray-100 shadow-soft text-center">
                  <h3 className="font-heading font-bold text-lg mb-2">{content[`plan_${pi}_name`] || (pi === 1 ? "Basic" : pi === 2 ? "Pro" : "Enterprise")}</h3>
                  <div className="font-heading font-bold text-display mb-4">{content[`plan_${pi}_price`] || (pi === 1 ? "$9" : pi === 2 ? "$29" : "$99")}<span className="text-body-sm text-text-muted">/mo</span></div>
                  <ul className="text-body-sm text-text-secondary space-y-2 mb-6">
                    {[1, 2, 3, 4].map((fi) => {
                      const feat = content[`plan_${pi}_feat_${fi}`];
                      return feat ? <li key={fi}>{feat}</li> : null;
                    })}
                  </ul>
                  <a href="#" className="block w-full px-4 py-2 rounded-soft border-2 border-brand-primary text-brand-primary font-semibold hover:bg-brand-primary/5 transition-all">
                    {content[`plan_${pi}_cta`] || "Choose Plan"}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case "faq":
      return (
        <section className={bg + " py-12 md:py-16"}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="font-heading text-heading font-bold mb-3">{content.title}</h2>
              <p className="text-body-lg text-text-secondary">{content.subtitle}</p>
            </div>
            <div className="max-w-2xl mx-auto">
              {[1, 2, 3].map((i) => (
                <details key={i} className="group border-b border-gray-200 py-4">
                  <summary className="flex items-center justify-between cursor-pointer text-body font-medium">
                    {content[`q_${i}`] || `Question ${i}?`}
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </summary>
                  <p className="text-body-sm text-text-secondary mt-3">{content[`a_${i}`] || "Answer."}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      );
    case "stats":
      return (
        <section className={bg + " py-12 md:py-20"}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
              {[
                { value: content.stat_1_value || "10K+", label: content.stat_1_label || "Users" },
                { value: content.stat_2_value || "99%", label: content.stat_2_label || "Uptime" },
                { value: content.stat_3_value || "50+", label: content.stat_3_label || "Countries" },
                { value: content.stat_4_value || "4.9", label: content.stat_4_label || "Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-heading font-bold text-display">{stat.value}</div>
                  <div className="text-body-sm opacity-70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    default:
      return (
        <section className={bg + " py-12"}>
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="font-heading text-heading-sm font-bold mb-2">{content.title || type}</h2>
            <p className="text-body text-text-secondary">{content.subtitle || ""}</p>
          </div>
        </section>
      );
  }
}

export function LandingPageClient() {
  const { layoutSchema, contextProfile } = useGenerationStore();

  // Google Fonts dynamic loading
  useEffect(() => {
    if (!contextProfile) return;
    const fonts = [contextProfile.primaryFont, contextProfile.secondaryFont].filter(Boolean);
    const uniqueFonts = fonts.filter((v, i, a) => a.indexOf(v) === i);
    const family = uniqueFonts.map((f) => `${f.replace(/\s+/g, "+")}:wght@400;600;700;800`).join("&family=");
    const href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;

    let link = document.getElementById("dynamo-google-fonts") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = "dynamo-google-fonts";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;

    return () => {
      const el = document.getElementById("dynamo-google-fonts");
      if (el) el.remove();
    };
  }, [contextProfile]);

  // Scroll animation with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("dynamo-visible");
            entry.target.classList.remove("dynamo-hidden");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const sections = document.querySelectorAll(".dynamo-animate");
    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [layoutSchema]);

  if (!layoutSchema || !contextProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 rounded-xl gradient-brand flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-heading font-bold text-xl">D</span>
          </div>
          <h1 className="font-heading text-heading-sm font-bold mb-3">No Page Generated</h1>
          <p className="text-body text-text-secondary mb-6">
            Generate a page first, then view it here as a standalone landing page.
          </p>
          <a
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-soft bg-brand-primary text-white font-semibold hover:bg-[var(--brand-primary-dark)] transition-all"
          >
            Create Page
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <ReadingProgressBar />
      <BackToTopButton />
      <FloatingCTABar
        ctaText={layoutSchema.sections.find((s) => s.type === "hero")?.content?.cta || ""}
        ctaHref="#cta"
      />
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <span className="text-white font-heading font-bold text-sm">D</span>
            </div>
            <span className="font-heading font-bold">DYNAMO</span>
          </div>
          <a
            href="/preview/demo"
            className="text-caption text-text-secondary hover:text-text-primary transition-colors"
          >
            Back to Editor
          </a>
        </div>
      </header>

      <main className="pt-14">
        {layoutSchema.sections.map((section, index) => (
          <StaggeredSection key={section.id} index={index}>
            <RenderSection section={section} />
          </StaggeredSection>
        ))}
      </main>

      <footer className="border-t border-gray-100 bg-brand-dark text-white/70">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-white">DYNAMO</span>
            <span className="text-caption">Generated by Dynamo AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
