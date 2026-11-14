"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

export type RevealVariant = "up" | "blur" | "scale" | "fade" | "left" | "right";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay in ms before the reveal transition starts once in view. */
  delay?: number;
  /** Motion flavour. `up` is the default short 18px rise; `blur` adds a blur→sharp focus pull. */
  variant?: RevealVariant;
  /** IntersectionObserver threshold (0–1). */
  threshold?: number;
  /** Render as a different element (defaults to `div`). */
  as?: ElementType;
  style?: CSSProperties;
};

const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: "",
  blur: "reveal-blur",
  scale: "reveal-scale",
  fade: "reveal-fade",
  left: "reveal-left",
  right: "reveal-right",
};

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  variant = "up",
  threshold,
  as: Tag = "div",
  style,
}: ScrollRevealProps) {
  const { ref, inView } = useInView<HTMLElement>(threshold);

  return (
    <Tag
      ref={ref}
      className={cn(
        inView ? "reveal-visible" : "reveal-hidden",
        VARIANT_CLASS[variant],
        className,
      )}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
