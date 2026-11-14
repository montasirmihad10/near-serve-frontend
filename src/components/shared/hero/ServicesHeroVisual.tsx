"use client";

import type { CSSProperties } from "react";
import { Wrench, Zap, Palette, Wind, Sparkles, Grid3X3, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TILES = [
  { icon: Wrench, name: "Plumbing", jobs: "240+", span: "col-span-2", featured: false },
  { icon: Zap, name: "Electrical", jobs: "180+", span: "", featured: false },
  { icon: Palette, name: "Painting", jobs: "320+", span: "", featured: false },
  { icon: Sparkles, name: "Cleaning", jobs: "410+", span: "col-span-2", featured: true },
  { icon: Wind, name: "AC & Cooling", jobs: "195+", span: "", featured: false },
  { icon: Grid3X3, name: "Tiling", jobs: "155+", span: "", featured: false },
];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function ServicesHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle_at_70%_30%,rgba(199,10,36,0.22),transparent_65%)]"
      />

      <div className="relative overflow-hidden rounded-[2rem] p-1">
        <div className="relative grid grid-cols-3 gap-3">
          {TILES.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.name}
                className={cn("hero-in", tile.span)}
                style={d(280 + i * 70)}
              >
                <div
                  className={cn(
                    "group relative flex h-full min-h-[8.5rem] flex-col justify-between overflow-hidden rounded-[1.4rem] p-4 transition-transform duration-400 ease-[var(--ease-out-expo)] hover:-translate-y-1",
                    tile.featured
                      ? "bg-brand text-white shadow-[0_24px_48px_-20px_rgba(199,10,36,0.55)]"
                      : "glass-dark text-white",
                  )}
                >
                  <div className="relative flex items-start justify-between">
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl",
                        tile.featured ? "bg-white/20" : "bg-white/[0.07]",
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <ArrowUpRight
                      className={cn(
                        "h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                        tile.featured ? "text-white/70" : "text-white/30",
                      )}
                    />
                  </div>
                  <div className="relative">
                    <div className="font-fraunces text-base font-semibold leading-tight">
                      {tile.name}
                    </div>
                    <div
                      className={cn(
                        "mt-0.5 text-[11px] font-medium",
                        tile.featured ? "text-white/80" : "text-white/45",
                      )}
                    >
                      {tile.jobs} jobs this month
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="hero-in col-span-3" style={d(780)}>
            <div className="hairline-dark flex items-center justify-between rounded-[1.4rem] bg-white/[0.04] px-5 py-3.5 text-sm">
              <span className="text-white/60">
                <span className="font-fraunces text-lg font-semibold text-white">44</span> more
                categories
              </span>
              <span className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                <span className="live-dot" />
                840+ providers online
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-in absolute -left-3 -top-5 sm:-left-7" style={d(900)}>
        <div className="rounded-2xl bg-white px-4 py-3 text-ink shadow-[0_14px_36px_-12px_rgba(0,0,0,0.35)]">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Avg. response
          </div>
          <div className="font-fraunces text-2xl font-semibold leading-none">12 min</div>
        </div>
      </div>
    </div>
  );
}
