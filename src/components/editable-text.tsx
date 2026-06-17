"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

interface EditableTextProps {
  value: string;
  onSave: (val: string) => void;
  tag?: Tag;
  className?: string;
  placeholder?: string;
}

export function EditableText({ value, onSave, tag = "span", className = "", placeholder = "" }: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing]);

  const save = () => {
    setEditing(false);
    const v = (ref.current?.textContent || "").trim();
    if (v && v !== value) onSave(v);
    else if (ref.current) ref.current.textContent = value;
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ref.current?.blur();
    }
    if (e.key === "Escape") {
      if (ref.current) ref.current.textContent = value;
      setEditing(false);
    }
  };

  if (!editing) {
    const Tag = tag;
    return (
      <Tag
        className={`cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-brand-primary/40 rounded-soft px-0.5 transition-all ${className}`}
        onClick={() => setEditing(true)}
        title="Click to edit"
      >
        {value || placeholder}
      </Tag>
    );
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`outline outline-2 outline-brand-primary rounded-soft px-0.5 -mx-0.5 min-w-[2rem] ${className}`}
      onBlur={save}
      onKeyDown={handleKey}
    >
      {value}
    </div>
  );
}