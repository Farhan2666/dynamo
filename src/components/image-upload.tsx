"use client";

import { useState, useRef } from "react";

interface ImageUploadProps {
  sectionId: string;
  existingUrl?: string;
  onSave: (sectionId: string, dataUrl: string) => void;
  className?: string;
  aspectRatio?: string;
  label?: string;
}

function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = (h * maxWidth) / w;
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(URL.createObjectURL(file)); return; }
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/webp", quality);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

export function ImageUpload({ sectionId, existingUrl, onSave, className = "", aspectRatio = "4/3", label = "Add Image" }: ImageUploadProps) {
  const [preview, setPreview] = useState(existingUrl || "");
  const [dragging, setDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Not an image file"); return; }
    setLoading(true);
    setError("");
    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
      onSave(sectionId, compressed);
    } catch {
      setError("Failed to process image");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUrlSubmit = async () => {
    const url = urlValue.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setError("URL must start with http:// or https://");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      const loaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image from URL"));
        img.src = url;
      });
      await loaded;
      setPreview(url);
      onSave(sectionId, url);
      setShowUrlInput(false);
      setUrlValue("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-medium transition-all ${
        !preview ? "border-2 border-dashed" : "border-2 border-transparent"
      } ${
        dragging ? "border-brand-primary bg-brand-primary/5" : !preview ? "border-surface-tertiary bg-surface-secondary/50 hover:border-brand-primary/30" : ""
      } ${className}`}
      style={{ aspectRatio }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Uploaded"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => inputRef.current?.click()}
          />
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setShowUrlInput(true); }}
              className="w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center text-caption hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
              title="Change image URL"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 3l3 3M9 4l-3 3a2 2 0 002 2l3-3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 13l-3-3M7 12l3-3a2 2 0 00-2-2l-3 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setPreview(""); onSave(sectionId, ""); }}
              className="w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-caption hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
          {preview.startsWith("data:") && (
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/40 text-[8px] text-white/70">
              embedded
            </div>
          )}
          {preview.startsWith("http") && (
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/40 text-[8px] text-white/70">
              link
            </div>
          )}
        </>
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-1.5"
          onClick={() => !showUrlInput && inputRef.current?.click()}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-caption text-text-muted">{label}</span>
          <span className="text-[9px] text-text-muted/60">click to upload or paste URL</span>

          {showUrlInput && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-secondary/95 p-2" onClick={(e) => e.stopPropagation()}>
              <div className="w-full flex gap-1">
                <input
                  ref={urlInputRef}
                  type="text"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleUrlSubmit(); if (e.key === "Escape") setShowUrlInput(false); }}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-2 py-1.5 text-caption bg-white border border-surface-tertiary rounded-soft focus:outline-none focus:ring-1 focus:ring-brand-primary/50 min-w-0"
                  autoFocus
                />
                <button
                  onClick={handleUrlSubmit}
                  className="px-2 py-1.5 rounded-soft bg-brand-primary text-white text-caption font-medium hover:opacity-90 transition-opacity shrink-0"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowUrlInput(false)}
                  className="px-2 py-1.5 rounded-soft border border-surface-tertiary text-caption text-text-muted hover:bg-surface-tertiary transition-colors shrink-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-red-50 border border-red-200 text-caption text-red-600 text-center">
              {error}
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
