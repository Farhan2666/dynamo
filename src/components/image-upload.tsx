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

export function ImageUpload({ sectionId, existingUrl, onSave, className = "", aspectRatio = "4/3", label = "Add Image" }: ImageUploadProps) {
  const [preview, setPreview] = useState(existingUrl || "");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      onSave(sectionId, dataUrl);
    };
    reader.readAsDataURL(file);
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

  return (
    <div
      className={`relative overflow-hidden rounded-medium border-2 border-dashed transition-all ${
        dragging ? "border-brand-primary bg-brand-primary/5" : preview ? "border-transparent" : "border-surface-tertiary bg-surface-secondary/50 hover:border-brand-primary/30"
      } ${className}`}
      style={{ aspectRatio }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !preview && inputRef.current?.click()}
    >
      {preview ? (
        <>
          <img
            src={preview}
            alt="Uploaded"
            className="w-full h-full object-cover cursor-pointer group"
            onClick={() => inputRef.current?.click()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setPreview(""); onSave(sectionId, ""); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-caption hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
          >
            ✕
          </button>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-caption text-text-muted">{label}</span>
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
