"use client";

import { useRef, useEffect, useState } from "react";

interface FormatToolbarProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

const FONTS = ["Inter", "Sora", "JetBrains Mono", "Georgia", "Arial", "system-ui"];

const FONT_SIZES = [
  { label: "XS", value: "1" },
  { label: "SM", value: "2" },
  { label: "Base", value: "3" },
  { label: "LG", value: "4" },
  { label: "XL", value: "5" },
  { label: "2XL", value: "6" },
  { label: "3XL", value: "7" },
];

export function FormatToolbar({ containerRef, onClose }: FormatToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const textColorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowFontMenu(false);
        setShowSizeMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const exec = (cmd: string, val?: string) => {
    containerRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    exec("foreColor", e.target.value);
  };

  return (
    <div
      ref={toolbarRef}
      className="flex items-center gap-0.5 p-1 rounded-medium bg-white border border-surface-tertiary shadow-medium mb-2 flex-wrap"
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        onClick={() => exec("bold")}
        className="w-7 h-7 flex items-center justify-center rounded-soft hover:bg-surface-secondary text-text-primary font-bold text-sm"
        title="Bold"
      >
        B
      </button>
      <button
        onClick={() => exec("italic")}
        className="w-7 h-7 flex items-center justify-center rounded-soft hover:bg-surface-secondary text-text-primary italic text-sm"
        title="Italic"
      >
        I
      </button>
      <button
        onClick={() => exec("underline")}
        className="w-7 h-7 flex items-center justify-center rounded-soft hover:bg-surface-secondary text-text-primary underline text-sm"
        title="Underline"
      >
        U
      </button>

      <div className="w-px h-5 bg-surface-tertiary mx-0.5" />

      <button
        onClick={() => exec("justifyLeft")}
        className="w-7 h-7 flex items-center justify-center rounded-soft hover:bg-surface-secondary text-text-primary text-xs"
        title="Align Left"
      >
        ≡
      </button>
      <button
        onClick={() => exec("justifyCenter")}
        className="w-7 h-7 flex items-center justify-center rounded-soft hover:bg-surface-secondary text-text-primary text-xs"
        title="Align Center"
      >
        ≣
      </button>
      <button
        onClick={() => exec("justifyRight")}
        className="w-7 h-7 flex items-center justify-center rounded-soft hover:bg-surface-secondary text-text-primary text-xs"
        title="Align Right"
      >
        ≡
      </button>

      <div className="w-px h-5 bg-surface-tertiary mx-0.5" />

      <div className="relative">
        <button
          onClick={() => { setShowFontMenu(!showFontMenu); setShowSizeMenu(false); }}
          className="h-7 px-2 flex items-center gap-1 rounded-soft hover:bg-surface-secondary text-caption text-text-primary"
          title="Font Family"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><text x="0" y="12" fontSize="14" fontWeight="bold" fill="currentColor">T</text></svg>
        </button>
        {showFontMenu && (
          <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-surface-tertiary rounded-medium shadow-medium z-50 p-1">
            {FONTS.map((f) => (
              <button
                key={f}
                onClick={() => { exec("fontName", f); setShowFontMenu(false); }}
                className="w-full text-left px-2 py-1.5 text-caption rounded-soft hover:bg-surface-secondary text-text-primary"
                style={{ fontFamily: f }}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => { setShowSizeMenu(!showSizeMenu); setShowFontMenu(false); }}
          className="h-7 px-2 flex items-center gap-1 rounded-soft hover:bg-surface-secondary text-caption text-text-primary"
          title="Font Size"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><text x="0" y="12" fontSize="14" fill="currentColor">A</text><text x="8" y="10" fontSize="10" fill="currentColor">A</text></svg>
        </button>
        {showSizeMenu && (
          <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-surface-tertiary rounded-medium shadow-medium z-50 p-1">
            {FONT_SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => { exec("fontSize", s.value); setShowSizeMenu(false); }}
                className="w-full text-left px-2 py-1.5 text-caption rounded-soft hover:bg-surface-secondary text-text-primary"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => textColorInputRef.current?.click()}
          className="w-7 h-7 flex items-center justify-center rounded-soft hover:bg-surface-secondary text-text-primary text-xs"
          title="Text Color"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 1l4 10H4L8 1zM4 13h8v2H4z" fill="currentColor" />
          </svg>
        </button>
        <input
          ref={textColorInputRef}
          type="color"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleColorChange}
        />
      </div>

      <div className="w-px h-5 bg-surface-tertiary mx-0.5" />

      <button
        onClick={onClose}
        className="w-7 h-7 flex items-center justify-center rounded-soft hover:bg-red-50 text-text-muted hover:text-red-500 text-xs"
        title="Close"
      >
        ✕
      </button>
    </div>
  );
}
