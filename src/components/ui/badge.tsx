import type { ReactNode } from "react";

type BadgeVariant = "primary" | "secondary" | "accent" | "neutral" | "success";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  primary: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
  secondary: "bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20",
  accent: "bg-brand-accent/10 text-brand-accent border-brand-accent/20",
  neutral: "bg-surface-tertiary text-text-secondary border-surface-tertiary",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5 text-caption font-medium
        rounded-full border
        ${badgeVariants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
