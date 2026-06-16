import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary:
    "bg-brand-primary text-white hover:bg-[var(--brand-primary-dark)] shadow-soft hover:shadow-medium active:scale-[0.98]",
  secondary:
    "bg-brand-secondary text-white hover:bg-[var(--brand-secondary-dark)] shadow-soft hover:shadow-medium active:scale-[0.98]",
  ghost:
    "bg-transparent text-text-primary hover:bg-surface-tertiary active:scale-[0.98]",
  danger:
    "bg-brand-accent text-white hover:opacity-90 shadow-soft active:scale-[0.98]",
  outline:
    "bg-transparent border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5 active:scale-[0.98]",
};

const sizes = {
  sm: "px-3 py-1.5 text-body-sm rounded-soft",
  md: "px-4 py-2 text-body rounded-soft",
  lg: "px-6 py-3 text-body-lg rounded-soft",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 font-semibold
          transition-all duration-[var(--transition-fast)]
          focus-ring
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${loading ? "cursor-wait" : ""}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
