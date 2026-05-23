import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-60",
        variant === "primary" &&
          "bg-primary text-[#10231C] shadow-soft hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0",
        variant === "secondary" &&
          "border border-line bg-white text-ink hover:-translate-y-0.5 hover:bg-primary/10",
        variant === "ghost" && "text-ink-muted hover:bg-primary/10 hover:text-ink",
        className
      )}
      {...props}
    />
  );
}
