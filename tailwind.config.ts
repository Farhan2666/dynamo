import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6E56CF",
          "primary-light": "#8B75E0",
          "primary-dark": "#5A3FAF",
          secondary: "#00C4B4",
          "secondary-light": "#33D6C8",
          "secondary-dark": "#00A094",
          dark: "#1A1A2E",
          "dark-light": "#2A2A4A",
          light: "#F5F5FF",
          "light-muted": "#E8E8F5",
          accent: "#FF7E33",
          "accent-light": "#FF9955",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F8F8FE",
          tertiary: "#EEEEF8",
          dark: "#1A1A2E",
          "dark-secondary": "#222244",
          "dark-tertiary": "#2A2A50",
        },
        text: {
          primary: "#1A1A2E",
          secondary: "#555570",
          muted: "#8888A0",
          inverse: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Sora", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        display: ["3.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        heading: ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "heading-sm": ["2rem", { lineHeight: "1.25" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        body: ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        caption: ["0.75rem", { lineHeight: "1.5" }],
      },
      borderRadius: {
        soft: "6px",
        DEFAULT: "8px",
        medium: "12px",
        large: "16px",
        xl: "24px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(26, 26, 46, 0.06)",
        medium: "0 4px 16px rgba(26, 26, 46, 0.08)",
        strong: "0 8px 32px rgba(26, 26, 46, 0.12)",
        glow: "0 0 24px rgba(110, 86, 207, 0.25)",
        "glow-teal": "0 0 24px rgba(0, 196, 180, 0.25)",
        inner: "inset 0 1px 2px rgba(26, 26, 46, 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "bounce-soft": "bounceSoft 0.6s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        bounceSoft: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "50%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
