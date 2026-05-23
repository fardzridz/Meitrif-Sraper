import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helper?: ReactNode;
  error?: ReactNode;
};

export function Input({ className, label, helper, error, id, ...props }: InputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="grid gap-2 text-sm font-medium text-ink" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        className={cn(
          "h-11 rounded-md border border-line bg-white px-3 text-base text-ink transition placeholder:text-ink-subtle focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-ink-muted",
          error && "border-danger",
          className
        )}
        {...props}
      />
      {helper && !error ? <span className="text-sm font-normal text-ink-muted">{helper}</span> : null}
      {error ? <span className="text-sm font-medium text-danger">{error}</span> : null}
    </label>
  );
}
