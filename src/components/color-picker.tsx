"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { contrastRatio, COLOR_PSYCHOLOGY } from "@/lib/utils/contrast";

interface ColorSwatch {
  hex: string;
  locked: boolean;
  role: "primary" | "secondary" | "accent";
}

const PRESETS = [
  ["#6E56CF", "#00C4B4", "#FF7E33"],
  ["#3498DB", "#2ECC71", "#F39C12"],
  ["#E74C3C", "#9B59B6", "#1A1A2E"],
  ["#1A1A2E", "#F5F5FF", "#6E56CF"],
  ["#2ECC71", "#3498DB", "#F5F5FF"],
  ["#FF7E33", "#1A1A2E", "#F5F5FF"],
];

function harmonizeColors(colors: string[]): string[] {
  const targetHues = [
    { h: 260, s: 55, l: 55 },
    { h: 175, s: 100, l: 40 },
    { h: 20, s: 100, l: 60 },
  ];
  return colors.map((hex, i) => {
    const t = targetHues[i % targetHues.length];
    const [r, g, b] = [1, 2, 3].map((j) => parseInt(hex.slice(j * 2 - 1, j * 2 + 1), 16));
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2 / 255 * 100;
    const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l / 100 - 1)) / 255 * 100;
    const newS = (s + t.s) / 2;
    const newL = (l + t.l) / 2;
    const c = (1 - Math.abs(2 * newL / 100 - 1)) * newS / 100;
    const x = c * (1 - Math.abs(((t.h / 60) % 2) - 1));
    const m = newL / 100 - c / 2;
    const [r1, g1, b1] = t.h < 60 ? [c, x, 0] : t.h < 120 ? [x, c, 0] : t.h < 180 ? [0, c, x] : t.h < 240 ? [0, x, c] : t.h < 300 ? [x, 0, c] : [c, 0, x];
    return `#${[r1, g1, b1].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("")}`;
  });
}

interface ColorPickerProps {
  colors: { primary: string; secondary: string; accent: string };
  onChange: (colors: { primary: string; secondary: string; accent: string }) => void;
}

export function ColorPicker({ colors, onChange }: ColorPickerProps) {
  const [swatches, setSwatches] = useState<ColorSwatch[]>([
    { hex: colors.primary, locked: false, role: "primary" },
    { hex: colors.secondary, locked: false, role: "secondary" },
    { hex: colors.accent, locked: false, role: "accent" },
  ]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showPsychology, setShowPsychology] = useState<number | null>(null);

  const updateSwatch = useCallback(
    (index: number, hex: string) => {
      const next = [...swatches];
      next[index] = { ...next[index], hex };
      setSwatches(next);
      onChange({
        primary: next[0].hex,
        secondary: next[1].hex,
        accent: next[2].hex,
      });
    },
    [swatches, onChange]
  );

  const toggleLock = useCallback((index: number) => {
    setSwatches((prev) =>
      prev.map((s, i) => (i === index ? { ...s, locked: !s.locked } : s))
    );
  }, []);

  const handleHarmonize = useCallback(() => {
    const unlocked = swatches.filter((s) => !s.locked).map((s) => s.hex);
    const harmonized = harmonizeColors(unlocked);
    let li = 0;
    const next = swatches.map((s) => {
      if (s.locked) return s;
      return { ...s, hex: harmonized[li++] };
    });
    setSwatches(next);
    onChange({
      primary: next[0].hex,
      secondary: next[1].hex,
      accent: next[2].hex,
    });
  }, [swatches, onChange]);

  const applyPreset = useCallback(
    (preset: string[]) => {
      const next = swatches.map((s, i) => (s.locked ? s : { ...s, hex: preset[i] }));
      setSwatches(next);
      onChange({
        primary: next[0].hex,
        secondary: next[1].hex,
        accent: next[2].hex,
      });
    },
    [swatches, onChange]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-body-sm font-semibold text-text-primary">Color Palette</h4>
        <button
          onClick={handleHarmonize}
          className="text-caption text-brand-primary hover:underline font-medium"
        >
          Harmonize
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {swatches.map((swatch, i) => {
          const textColor = contrastRatio(swatch.hex, "#1A1A2E") >= 4.5 ? "#1A1A2E" : "#FFFFFF";
          const ratio = contrastRatio(swatch.hex, "#1A1A2E");
          const wcagPass = ratio >= 4.5;
          const psych = COLOR_PSYCHOLOGY[swatch.hex.toUpperCase()];

          return (
            <div key={i} className="relative">
              <div
                className="relative rounded-soft overflow-hidden cursor-pointer group border border-surface-tertiary"
                style={{ backgroundColor: swatch.hex, minHeight: 72 }}
                onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                onMouseEnter={() => setShowPsychology(i)}
                onMouseLeave={() => setShowPsychology(null)}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center">
                  <span className="font-mono text-[10px] font-medium" style={{ color: textColor }}>
                    {swatch.hex}
                  </span>
                  <span className="text-[9px] font-mono opacity-70" style={{ color: textColor }}>
                    {swatch.role}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLock(i); }}
                  className={`absolute top-1 right-1 w-5 h-5 rounded flex items-center justify-center text-[10px] transition-all ${
                    swatch.locked
                      ? "bg-white/30 text-white"
                      : "bg-black/10 text-white/50 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {swatch.locked ? "🔒" : "🔓"}
                </button>

                <AnimatePresence>
                  {showPsychology === i && psych && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2 rounded-soft bg-brand-dark text-white text-[10px] leading-tight shadow-strong z-10"
                    >
                      <p className="font-medium mb-0.5">{psych.meaning}</p>
                      <p className="opacity-80">{psych.emotion}</p>
                      <p className="opacity-60 mt-0.5">Best: {psych.bestFor}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!wcagPass && (
                <p className="text-[9px] text-brand-accent mt-1 text-center">
                  Low contrast with text
                </p>
              )}

              {editingIndex === i && (
                <div className="mt-1 flex gap-1">
                  <input
                    type="color"
                    value={swatch.hex}
                    onChange={(e) => updateSwatch(i, e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-surface-tertiary"
                  />
                  <input
                    type="text"
                    value={swatch.hex}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) updateSwatch(i, val);
                    }}
                    className="flex-1 px-1.5 py-1 text-[10px] font-mono bg-surface border border-surface-tertiary rounded-soft focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-none"
                    maxLength={7}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-soft bg-surface-secondary border border-surface-tertiary">
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption font-medium text-text-secondary">Contrast Report</span>
          <span className="text-caption text-text-muted">vs text (#1A1A2E)</span>
        </div>
        {swatches.map((s, i) => {
          const ratio = contrastRatio(s.hex, "#1A1A2E");
          const passes = ratio >= 4.5;
          const level = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "FAIL";
          return (
            <div key={i} className="flex items-center gap-2 py-1">
              <span
                className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: s.hex }}
              />
              <span className="text-caption font-mono text-text-secondary flex-1">
                {s.role}
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  passes ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                }`}
              >
                {level} ({ratio.toFixed(1)}:1)
              </span>
            </div>
          );
        })}
      </div>

      <div>
        <p className="text-caption font-medium text-text-muted mb-1.5">Quick Palettes</p>
        <div className="flex gap-1.5">
          {PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => applyPreset(preset)}
              className="flex gap-0.5 p-1 rounded-soft border border-surface-tertiary hover:border-brand-primary/40 transition-colors"
            >
              {preset.map((h, j) => (
                <span
                  key={j}
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: h }}
                />
              ))}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
