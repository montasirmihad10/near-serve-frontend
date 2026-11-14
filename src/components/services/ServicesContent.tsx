"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import ServicesHeroVisual from "@/components/shared/hero/ServicesHeroVisual";
import { ROUTES } from "@/utils/navigation";
import { cn } from "@/lib/utils";
import {
  Wrench,
  Zap,
  Palette,
  Wind,
  Sparkles,
  Grid3X3,
  Hammer,
  Home,
  Trees,
  Truck,
  Tv,
  ShieldCheck,
  Search,
  ArrowRight,
  ArrowUpRight,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  { icon: Wrench, name: "Plumbing", desc: "Leaks, pipes, fixtures, water heater & installations", jobs: 240, popular: true },
  { icon: Zap, name: "Electrical", desc: "Wiring, switches, fans, circuit breakers & power issues", jobs: 180, popular: true },
  { icon: Palette, name: "Painting", desc: "Interior, exterior, texture & touch-up wall work", jobs: 320, popular: true },
  { icon: Wind, name: "AC & Cooling", desc: "Installation, chemical servicing, compressor & gas refill", jobs: 195, popular: true },
  { icon: Sparkles, name: "Cleaning", desc: "Deep home cleaning, office sanitizing & sofa care", jobs: 410, popular: true },
  { icon: Grid3X3, name: "Tiling & Flooring", desc: "Bathroom, kitchen, marble polishing & tile grout", jobs: 155, popular: false },
  { icon: Hammer, name: "Carpentry", desc: "Custom furniture, doors, kitchen cabinets & woodwork", jobs: 130, popular: false },
  { icon: Home, name: "Renovation", desc: "Full room makeovers, false ceilings & civil remodeling", jobs: 95, popular: false },
  { icon: Trees, name: "Gardening", desc: "Lawn care, terrace garden, plants & landscaping", jobs: 78, popular: false },
  { icon: Truck, name: "Moving & Delivery", desc: "House shifting, heavy furniture moves & local transport", jobs: 112, popular: false },
  { icon: Tv, name: "Appliance Repair", desc: "Refrigerator, washing machine, microwave & ovens", jobs: 88, popular: false },
  { icon: ShieldCheck, name: "Security & CCTV", desc: "Camera installation, smart locks & burglar alarms", jobs: 64, popular: false },
];

const POPULAR_SEARCHES = ["Fix leaking tap", "AC not cooling", "Paint my bedroom", "Bathroom tiling"];

const BOOKING_STEPS = [
  {
    step: "01",
    title: "Pick your category",
    desc: "Choose the service you need or describe your issue in plain language.",
  },
  {
    step: "02",
    title: "Receive competing bids",
    desc: "Verified providers nearby submit clear quotes and timelines.",
  },
  {
    step: "03",
    title: "Pay only after approval",
    desc: "Compare offers, choose a pro, and release payment once you are satisfied.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em]",
        tone === "dark" ? "text-white/50" : "text-muted",
        className,
      )}
    >
      <span className="h-px w-8 bg-brand" />
      {children}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/*  Category marquee — ambient ticker under the hero                          */
/* -------------------------------------------------------------------------- */

function CategoryMarquee() {
  const items = [...CATEGORIES, ...CATEGORIES];
  return (
    <div
      className="marquee relative border-t border-white/[0.08]"
      style={{ "--marquee-duration": "70s" } as CSSProperties}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent" />
      <div className="overflow-hidden py-5">
        <ul className="marquee-track flex w-max items-center gap-12 pr-12">
          {items.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <li
                key={`${cat.name}-${i}`}
                className="flex items-center gap-3 whitespace-nowrap text-sm text-white/60"
                aria-hidden={i >= CATEGORIES.length}
              >
                <Icon className="h-4 w-4 text-white/40" strokeWidth={1.75} />
                <span className="font-medium text-white/80">{cat.name}</span>
                <span className="text-white/35">{cat.jobs}+ jobs</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function ServicesContent() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CATEGORIES.filter((c) => {
      const matchesSearch =
        !q || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
      const matchesFilter = !activeCategory || c.name === activeCategory;
      return matchesSearch && matchesFilter;
    });
  }, [search, activeCategory]);

  const isFiltering = Boolean(search.trim()) || activeCategory !== null;
  const gridKey = `${search.trim().toLowerCase()}|${activeCategory ?? ""}`;

  const clearAll = () => {
    setSearch("");
    setActiveCategory(null);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="aurora absolute -left-[8%] -top-[18%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(199,10,36,0.36),transparent_70%)]" />
          <div className="absolute -right-[10%] bottom-0 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(26,18,8,0.55))]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:pb-24 lg:pt-40">
          <div className="lg:col-span-6">
            <Eyebrow tone="dark" className="hero-in">
              Service catalog
            </Eyebrow>

            <h1
              className="hero-in mt-7 font-fraunces text-4xl font-semibold leading-[1.04] tracking-[-0.02em] sm:text-6xl lg:text-[4.4rem] lg:leading-[1.02]"
              style={d(90)}
            >
              Every service
              <br />
              your home <em className="font-normal italic text-brand">needs.</em>
            </h1>

            <p
              className="hero-in mt-7 max-w-md text-base leading-relaxed text-white/65 sm:text-lg"
              style={d(190)}
            >
              From emergency plumbing to full home makeovers — verified local pros compete for
              your job, and you pay only when you are satisfied.
            </p>

            <div className="hero-in mt-10" style={d(290)}>
              <div className="glass-dark flex items-center gap-3 rounded-full py-2 pl-5 pr-2 transition-shadow duration-500 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(199,10,36,0.6),0_40px_90px_-30px_rgba(0,0,0,0.65)]">
                <Search className="h-5 w-5 shrink-0 text-white/50" strokeWidth={1.75} />
                <input
                  className="min-w-0 flex-1 border-none bg-transparent py-2 text-sm font-medium text-white outline-none placeholder:text-white/40"
                  placeholder="Search services — plumbing, AC repair, painting…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search services"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    href={`${ROUTES.REGISTER}?role=customer&intent=hire&returnUrl=${encodeURIComponent(ROUTES.CUSTOMER_POST_JOB)}`}
                    className="app-btn hidden h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark sm:inline-flex"
                  >
                    Post a job
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="text-white/40">Popular</span>
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearch(term)}
                    className="text-white/70 underline decoration-white/20 underline-offset-4 transition-colors duration-300 hover:text-white hover:decoration-brand"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-in hidden lg:col-span-6 lg:block" style={d(260)}>
            <ServicesHeroVisual />
          </div>
        </div>

        <div className="hero-in relative" style={d(800)}>
          <CategoryMarquee />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Catalog                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <Eyebrow>{isFiltering ? "Filtered" : "All categories"}</Eyebrow>
              <h2 className="mt-5 font-fraunces text-4xl font-semibold tracking-tight text-ink md:text-5xl">
                {isFiltering ? "Matching services" : "Browse by category"}
              </h2>
              <p className="mt-3 text-sm text-muted sm:text-base">
                {filtered.length} categor{filtered.length === 1 ? "y" : "ies"}
                {isFiltering && (
                  <>
                    {" · "}
                    <button
                      type="button"
                      onClick={clearAll}
                      className="font-semibold text-brand underline-offset-4 hover:underline"
                    >
                      Clear filters
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* segmented filter */}
            <div className="scrollbar-none -mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
              <div className="hairline-light inline-flex w-max items-center gap-1 rounded-full bg-ink/[0.04] p-1">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className={cn(
                    "app-chip rounded-full px-4 py-2 text-sm font-semibold",
                    activeCategory === null
                      ? "bg-ink text-white shadow-[0_8px_20px_-8px_rgba(26,18,8,0.5)]"
                      : "text-warm hover:bg-white/70 hover:text-ink",
                  )}
                >
                  All
                </button>
                {CATEGORIES.filter((c) => c.popular).map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() =>
                      setActiveCategory(activeCategory === c.name ? null : c.name)
                    }
                    className={cn(
                      "app-chip rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap",
                      activeCategory === c.name
                        ? "bg-ink text-white shadow-[0_8px_20px_-8px_rgba(26,18,8,0.5)]"
                        : "text-warm hover:bg-white/70 hover:text-ink",
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80} className="mt-12">
            {filtered.length > 0 ? (
              <div key={gridKey} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.name}
                      href={`${ROUTES.REGISTER}?role=customer&intent=hire&returnUrl=${encodeURIComponent(ROUTES.CUSTOMER_POST_JOB)}`}
                      className="rise-in catalog-card glass-light edge-accent lift group flex h-full flex-col justify-between rounded-[1.6rem] p-6"
                      style={stagger(i)}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-deep text-ink transition-colors duration-500 group-hover:bg-brand group-hover:text-white">
                            <Icon className="h-5 w-5" strokeWidth={1.75} />
                          </span>
                          {cat.popular && (
                            <span className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-brand">
                              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                              Popular
                            </span>
                          )}
                        </div>
                        <h3 className="mt-6 font-fraunces text-xl font-semibold text-ink">{cat.name}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{cat.desc}</p>
                      </div>

                      <div className="mt-7 flex items-center justify-between text-xs font-semibold">
                        <span className="text-muted">{cat.jobs}+ jobs posted</span>
                        <span className="flex items-center gap-1 text-ink transition-colors duration-300 group-hover:text-brand">
                          Post job
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rise-in glass-light mx-auto max-w-xl rounded-[2rem] px-8 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-deep text-ink">
                  <Search className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-6 font-fraunces text-2xl font-semibold text-ink">
                  No matching services
                </h3>
                <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
                  Describe what you need in your own words and we will match you with qualified
                  providers.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button
                    type="button"
                    onClick={clearAll}
                    className="app-btn hairline-light rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink"
                  >
                    Clear filters
                  </button>
                  <Link
                    href={`${ROUTES.REGISTER}?role=customer&intent=hire&returnUrl=${encodeURIComponent(ROUTES.CUSTOMER_POST_JOB)}`}
                    className="app-btn inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
                  >
                    Post a custom job
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Booking path                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-ink py-24 text-white md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgba(199,10,36,0.3),transparent_55%)]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <ScrollReveal className="lg:col-span-4">
              <Eyebrow tone="dark">Simple &amp; transparent</Eyebrow>
              <h2 className="mt-5 font-fraunces text-4xl font-semibold tracking-tight md:text-5xl">
                Book any service in three steps
              </h2>
              <p className="mt-4 text-white/60">
                Quality work from verified local pros with complete peace of mind.
              </p>
              <Link
                href={ROUTES.HOW_IT_WORKS}
                className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
              >
                See the detailed walkthrough
                <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
              </Link>
            </ScrollReveal>

            <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8 lg:gap-8">
              {BOOKING_STEPS.map((item, i) => (
                <ScrollReveal
                  key={item.step}
                  variant="up"
                  delay={120 + i * 110}
                  className="relative border-t border-white/[0.1] pt-7"
                >
                  <span className="absolute -top-px left-0 h-px w-10 bg-brand" />
                  <div className="font-fraunces text-sm font-semibold text-brand">{item.step}</div>
                  <h3 className="mt-4 font-fraunces text-xl font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{item.desc}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CTA                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="scale">
            <div className="relative overflow-hidden rounded-[2.25rem] bg-[linear-gradient(145deg,#fffefb_0%,#f3ebe0_100%)] px-8 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(26,18,8,0.05),0_40px_90px_-40px_rgba(26,18,8,0.3)] md:px-16 md:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(199,10,36,0.1),transparent_70%)]"
              />
              <div className="relative z-10 mx-auto max-w-xl">
                <h2 className="font-fraunces text-3xl font-semibold tracking-tight text-ink md:text-[2.75rem] md:leading-tight">
                  Can&apos;t find your exact service?
                </h2>
                <p className="mx-auto mt-4 max-w-md text-base text-muted">
                  Describe what you need in plain words — we connect you with the right verified
                  specialists automatically.
                </p>
                <Link
                  href={ROUTES.REGISTER}
                  className="app-btn mt-9 inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-sm font-semibold text-white shadow-[0_16px_40px_-12px_rgba(199,10,36,0.6)] hover:bg-brand-dark"
                >
                  Get started — post a job
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
