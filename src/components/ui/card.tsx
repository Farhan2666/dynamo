import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glass-dark" | "gradient";
  padding?: "sm" | "md" | "lg";
  children: ReactNode;
}

const paddings = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const variants = {
  default: "bg-surface border border-surface-tertiary shadow-soft",
  glass: "glass",
  "glass-dark": "glass-dark",
  gradient: "gradient-surface border border-surface-tertiary",
};

export function Card({
  variant = "default",
  padding = "md",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-medium transition-all duration-[var(--transition-base)]
        ${variants[variant]}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
