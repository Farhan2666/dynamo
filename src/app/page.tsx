import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 w-full border-b border-surface-tertiary bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <span className="text-white font-heading font-bold text-sm">D</span>
            </div>
            <span className="font-heading font-bold text-lg">DYNAMO</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/setup"
              className="text-body-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-2"
            >
              Get Started
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-soft bg-brand-primary text-white font-semibold text-body-sm hover:bg-[var(--brand-primary-dark)] transition-all shadow-soft hover:shadow-medium"
            >
              Create Page
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="noise-bg absolute inset-0 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-caption font-medium text-brand-primary mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse-soft" />
              Multi-Agent Architecture ✕ Tailwind DNA
            </div>

            <h1 className="font-heading text-display font-bold leading-tight mb-6">
              Landing Pages{" "}
              <span className="text-gradient">with Brains,</span>
              <br />
              Not Templates
            </h1>

            <p className="text-body-lg text-text-secondary max-w-xl mb-10">
              First landing page generator that researches your market before
              designing. Three AI agents collaborate — like a digital architecture
              firm — to craft pages that feel human.
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-soft bg-brand-primary text-white font-semibold hover:bg-[var(--brand-primary-dark)] transition-all shadow-medium hover:shadow-strong active:scale-[0.98]"
              >
                Create Your First Page
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/setup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-soft border-2 border-brand-primary text-brand-primary font-semibold hover:bg-brand-primary/5 transition-all active:scale-[0.98]"
              >
                Setup API Key
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-surface-tertiary bg-surface-secondary/50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="font-heading text-heading font-bold mb-4">
              Three Agents, One Mission
            </h2>
            <p className="text-body-lg text-text-secondary max-w-lg mx-auto">
              Not a template engine. A digital architecture firm in your browser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Urban Planner",
                subtitle: "Context Analyzer",
                desc: "Researches your market, audience, and psychology before writing a single line of code. Outputs color palettes and font pairings based on industry science.",
                icon: (
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                ),
                color: "from-brand-primary to-purple-600",
              },
              {
                title: "Copywriter",
                subtitle: "Content Strategist",
                desc: "Crafts conversion-focused copy with variants. Headlines, CTAs, and benefit bullets that speak directly to your audience — not generic AI fluff.",
                icon: (
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                ),
                color: "from-brand-secondary to-teal-600",
              },
              {
                title: "Interior Designer",
                subtitle: "UI Engineer",
                desc: "Assembles layouts using 37 probabilistic patterns. Applies design heuristics, spacing rules, and micro-interactions that feel intentionally human.",
                icon: (
                  <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                ),
                color: "from-brand-accent to-orange-600",
              },
            ].map((agent) => (
              <div
                key={agent.title}
                className="group relative p-6 rounded-medium bg-surface border border-surface-tertiary shadow-soft hover:shadow-medium transition-all duration-[var(--transition-base)]"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center mb-4`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {agent.icon}
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-lg mb-1">
                  {agent.title}
                </h3>
                <p className="text-caption font-medium text-brand-primary mb-3">
                  {agent.subtitle}
                </p>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  {agent.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-surface-tertiary">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="font-heading text-heading font-bold mb-4">
              BYOK Freedom
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Bring your own API key. Native support for 8 LLM providers via
              OpenRouter. No lock-in, no hidden fees.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "OpenAI",
                "Anthropic",
                "Mistral",
                "Google",
                "Cohere",
                "Together",
                "Groq",
                "OpenRouter",
              ].map((p) => (
                <span
                  key={p}
                  className="px-3 py-1.5 rounded-soft bg-surface-tertiary text-body-sm font-medium text-text-secondary"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-surface-tertiary bg-brand-dark text-white/70">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-white">DYNAMO</span>
              <span className="text-caption">AI-Crafted Pages That Feel Human</span>
            </div>
            <div className="text-caption">
              © 2024 Dynamo. Multi-Agent Architecture.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
