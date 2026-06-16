import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-body-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3.5 py-2.5 text-body bg-surface border rounded-soft
            transition-all duration-[var(--transition-fast)]
            placeholder:text-text-muted
            focus-ring
            ${error ? "border-red-400 focus:ring-red-400/50" : "border-surface-tertiary hover:border-text-muted"}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-caption text-red-500">{error}</span>
        )}
        {hint && !error && (
          <span className="text-caption text-text-muted">{hint}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
