"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { ROUTES } from "@/utils/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Eye,
  Lock,
  MapPin,
  ShieldCheck,
  Star,
  X,
  Zap,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const STEPS = [
  {
    num: "01",
    tag: "Plain-language posting",
    title: "Describe what you need",
    desc: "Tell us what needs fixing in your own words — no complicated forms. NearServe reads urgency, location, and category in seconds.",
    visual: "search" as const,
  },
  {
    num: "02",
    tag: "Verified competition",
    title: "Local pros send their best offers",
    desc: "Admin-vetted specialists near you review the job and submit clear prices with timelines. Compare trust scores side by side.",
    visual: "bids" as const,
  },
  {
    num: "03",
    tag: "Payment protection",
    title: "Inspect first. Pay when satisfied.",
    desc: "Your payment is held safely until you check the work. Release funds only when everything looks right — or get support if it does not.",
    visual: "payment" as const,
  },
];

const SAFETY_STEPS = [
  { icon: Lock, label: "Payment secured", sub: "Held safely when you accept a bid" },
  { icon: Zap, label: "Work gets done", sub: "Provider arrives and completes the job" },
  { icon: Eye, label: "You inspect", sub: "Check quality before anything is released" },
  { icon: ShieldCheck, label: "Instant payout", sub: "Funds move only after your approval" },
];

const COMPARISON = {
  old: [
    "Calling dozens of unknown contacts",
    "No way to verify skill or background",
    "Paying advance cash with zero guarantees",
    "Unclear pricing and endless haggling",
  ],
  next: [
    "Describe once in everyday words",
    "Government ID & skill-vetted providers",
    "Pay only after inspecting completed work",
    "Transparent competitive bids in minutes",
  ],
};

const BIDS = [
  { name: "Karim M.", price: "৳8,500", time: "2 days", trust: 97, best: true },
  { name: "Ahmed K.", price: "৳9,200", time: "1 day", trust: 94, best: false },
  { name: "Sara R.", price: "৳7,800", time: "3 days", trust: 88, best: false },
];

const HERO_STATS = [
  { value: "4,800+", label: "jobs completed" },
  { value: "< 4 min", label: "average match time" },
  { value: "100%", label: "payment protection" },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

function useTypewriter(text: string, speed = 42, startDelay = 500) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let i = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(
      () => {
        if (reduceMotion) {
          setDisplayed(text);
          return;
        }
        interval = setInterval(() => {
          i += 1;
          setDisplayed(text.slice(0, i));
          if (i >= text.length && interval) clearInterval(interval);
        }, speed);
      },
      reduceMotion ? 0 : startDelay,
    );

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return displayed;
}

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
/*  Hero visual — a single live job card                                      */
/* -------------------------------------------------------------------------- */

const HERO_REQUEST = "I need my bathroom tiled this weekend in Mirpur.";

function HeroJobCard() {
  const typed = useTypewriter(HERO_REQUEST, 38, 700);
  const done = typed.length >= HERO_REQUEST.length;

  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-[radial-gradient(circle_at_30%_20%,rgba(199,10,36,0.22),transparent_65%)]"
      />

      <div className="glass-dark edge-accent relative overflow-hidden rounded-[1.75rem] p-6 sm:p-7">
        {/* header */}
        <div className="flex items-center justify-between text-xs text-white/55">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Mirpur, Dhaka · just now
          </span>
          <span className="flex items-center gap-2 font-semibold text-emerald-300">
            <span className="live-dot" />
            Live
          </span>
        </div>

        {/* request */}
        <p className="mt-5 min-h-[4.5rem] font-fraunces text-[1.35rem] leading-snug text-white sm:text-2xl">
          {typed}
          <span className="caret ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-brand" />
        </p>

        <div
          className={cn(
            "mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-white/45 transition-all duration-700",
            done ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
          )}
        >
          <span className="text-white/70">Understood:</span>
          <span>Tiling &amp; Floor</span>
          <span className="h-0.5 w-0.5 rounded-full bg-white/30" />
          <span>Mirpur</span>
          <span className="h-0.5 w-0.5 rounded-full bg-white/30" />
          <span>This weekend</span>
        </div>

        <div className="my-6 h-px bg-white/[0.08]" />

        {/* bids */}
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
          <span>3 offers in 4 min</span>
          <span className="flex items-center gap-1.5">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
            Verified
          </span>
        </div>

        <ul className="mt-3 space-y-2">
          {BIDS.map((bid, i) => (
            <li
              key={bid.name}
              className={cn(
                "hero-in flex items-center justify-between rounded-2xl px-4 py-3",
                bid.best ? "glass-dark-soft" : "",
              )}
              style={d(1200 + i * 140)}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold",
                    bid.best ? "bg-brand text-white" : "bg-white/10 text-white/80",
                  )}
                >
                  {initials(bid.name)}
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">{bid.name}</div>
                  <div className="text-[11px] text-white/50">
                    Trust {bid.trust} · {bid.time}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-fraunces text-base font-semibold text-white">{bid.price}</div>
                {bid.best && (
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                    Best match
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* protected footer */}
        <div
          className="hero-in hairline-dark mt-5 flex items-center justify-between rounded-2xl bg-ink/60 px-4 py-3"
          style={d(1700)}
        >
          <span className="flex items-center gap-2 text-sm text-white/80">
            <Lock className="h-4 w-4 text-emerald-400" />
            Payment protected until you approve
          </span>
          <span className="font-fraunces text-lg font-semibold text-white">৳8,500</span>
        </div>
      </div>

      {/* floating proof */}
      <div className="hero-in absolute -right-2 -top-5 sm:-right-6" style={d(900)}>
        <div className="rounded-2xl bg-white px-4 py-3 text-ink shadow-[0_18px_44px_-12px_rgba(0,0,0,0.45)]">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Matched in
          </div>
          <div className="font-fraunces text-2xl font-semibold leading-none">4 sec</div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step visuals                                                              */
/* -------------------------------------------------------------------------- */

function SearchMock() {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-ink p-6 text-white shadow-[0_40px_80px_-32px_rgba(26,18,8,0.55)] sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(199,10,36,0.3),transparent_55%)]" />
      <div className="relative z-10">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
          <span>New request</span>
          <span className="text-emerald-300">Understood in 4s</span>
        </div>
        <p className="mt-5 font-fraunces text-xl leading-snug sm:text-2xl">
          “I need my bathroom tiled this weekend in Mirpur…”
          <span className="caret ml-1 inline-block h-[1em] w-[2px] translate-y-[2px] bg-brand" />
        </p>
        <div className="my-6 h-px bg-white/[0.08]" />
        <dl className="grid grid-cols-3 gap-4 text-sm">
          {[
            ["Category", "Tiling"],
            ["Area", "Mirpur"],
            ["When", "This weekend"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] uppercase tracking-wider text-white/40">{k}</dt>
              <dd className="mt-1 font-semibold text-white">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function BidsMock() {
  return (
    <div className="space-y-3">
      {BIDS.map((bid) => (
        <div
          key={bid.name}
          className={cn(
            "flex items-center justify-between rounded-2xl px-5 py-4 transition-transform duration-500",
            bid.best
              ? "bg-ink text-white shadow-[0_30px_60px_-24px_rgba(26,18,8,0.6)]"
              : "glass-light text-ink",
          )}
        >
          <div className="relative z-10 flex items-center gap-3">
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold",
                bid.best ? "bg-brand text-white" : "bg-cream-deep text-ink",
              )}
            >
              {initials(bid.name)}
            </span>
            <div>
              <div className="text-sm font-semibold">{bid.name}</div>
              <div className={cn("text-xs", bid.best ? "text-white/60" : "text-muted")}>
                Trust {bid.trust} · {bid.time}
              </div>
            </div>
          </div>
          <div className="relative z-10 text-right">
            <div className="font-fraunces text-lg font-semibold">{bid.price}</div>
            {bid.best && (
              <div className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                Recommended
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentMock() {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-ink p-6 text-white shadow-[0_40px_80px_-32px_rgba(26,18,8,0.55)] sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(199,10,36,0.32),transparent_55%)]" />
      <div className="relative z-10">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-400" /> Payment protection
          </span>
          <span className="text-emerald-300">Secured</span>
        </div>
        <div className="mt-5 font-fraunces text-4xl font-semibold">৳8,500</div>
        <div className="mt-1 text-sm text-white/55">Held safely until you inspect &amp; approve</div>

        <div className="mt-7 flex items-center gap-2">
          {["Accepted", "In progress", "Inspect", "Release"].map((label, i) => (
            <div key={label} className="flex flex-1 flex-col gap-2">
              <div
                className={cn(
                  "h-1 rounded-full",
                  i < 2 ? "bg-brand" : i === 2 ? "bg-brand/50" : "bg-white/10",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  i <= 2 ? "text-white/80" : "text-white/35",
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepVisual({ type }: { type: (typeof STEPS)[number]["visual"] }) {
  if (type === "search") return <SearchMock />;
  if (type === "bids") return <BidsMock />;
  return <PaymentMock />;
}

/* -------------------------------------------------------------------------- */
/*  Safety rail — open timeline with a filling beam                           */
/* -------------------------------------------------------------------------- */

function SafetyRail() {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);

  return (
    <div ref={ref} className="relative mt-16">
      <div className="absolute left-0 right-0 top-6 hidden h-px bg-white/[0.08] lg:block" />
      <div
        className={cn(
          "absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-brand via-brand/80 to-emerald-400 lg:block",
          inView ? "rail-fill" : "scale-x-0",
        )}
      />

      <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {SAFETY_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li
              key={step.label}
              className={cn(inView ? "reveal-visible" : "reveal-hidden")}
              style={{ transitionDelay: `${250 + i * 140}ms` }}
            >
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),0_12px_30px_-10px_rgba(0,0,0,0.6)]">
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <div className="mt-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Step 0{i + 1}
              </div>
              <div className="mt-2 font-fraunces text-xl font-semibold">{step.label}</div>
              <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-white/55">{step.sub}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Final CTA with count-up                                                   */
/* -------------------------------------------------------------------------- */

function FinalCta() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const count = useCountUp(4800, inView, 1800);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[2.25rem] bg-ink px-8 py-16 text-center text-white shadow-[0_50px_100px_-40px_rgba(26,18,8,0.6)] md:px-16 md:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(199,10,36,0.35),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="font-fraunces text-6xl font-semibold tabular-nums tracking-tight md:text-7xl">
          {count.toLocaleString()}+
        </div>
        <p className="mt-3 text-sm text-white/60 sm:text-base">
          verified tasks completed safely on NearServe
        </p>
        <p className="mt-5 flex items-center justify-center gap-3 text-xs font-medium text-white/55 sm:text-sm">
          <span className="flex items-center gap-1.5 text-amber-300">
            <Star className="h-3.5 w-3.5 fill-amber-300" /> 4.9 average rating
          </span>
          <span className="h-0.5 w-0.5 rounded-full bg-white/30" />
          <span className="text-emerald-300">100% protected payments</span>
        </p>

        <h2 className="mt-12 font-fraunces text-3xl font-semibold tracking-tight md:text-[2.75rem] md:leading-tight">
          Ready to get your task done?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/60 sm:text-base">
          Post a task in plain words. Local pros start offering bids in minutes.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={`${ROUTES.REGISTER}?role=customer&intent=hire&returnUrl=${encodeURIComponent(ROUTES.CUSTOMER_POST_JOB)}`}
            className="app-btn inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-sm font-semibold text-white shadow-[0_16px_40px_-12px_rgba(199,10,36,0.7)] hover:bg-brand-dark"
          >
            Get started now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={ROUTES.FOR_PROVIDERS}
            className="group inline-flex items-center gap-2 px-2 py-4 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            Earn as a provider
            <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function HowItWorksContent() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-cream">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="aurora absolute -left-[8%] -top-[20%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(199,10,36,0.38),transparent_70%)]" />
          <div className="absolute -right-[10%] top-1/4 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(26,18,8,0.6))]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-16 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-8 lg:pb-28 lg:pt-40">
          <div className="lg:col-span-6">
            <Eyebrow tone="dark" className="hero-in">
              How NearServe works
            </Eyebrow>

            <h1
              className="hero-in mt-7 font-fraunces text-4xl font-semibold leading-[1.04] tracking-[-0.02em] sm:text-6xl lg:text-[4.6rem] lg:leading-[1.02]"
              style={d(90)}
            >
              From everyday problem
              <br />
              to <em className="font-normal italic text-brand">verified fix.</em>
            </h1>

            <p
              className="hero-in mt-7 max-w-md text-base leading-relaxed text-white/65 sm:text-lg"
              style={d(190)}
            >
              Post in plain words. Get competing offers from verified local pros. Your payment
              stays protected until the work is done right.
            </p>

            <div className="hero-in mt-10 flex flex-wrap items-center gap-5" style={d(290)}>
              <Link
                href={`${ROUTES.REGISTER}?role=customer&intent=hire&returnUrl=${encodeURIComponent(ROUTES.CUSTOMER_POST_JOB)}`}
                className="app-btn inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-[0_16px_40px_-12px_rgba(199,10,36,0.7)] hover:bg-brand-dark"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={ROUTES.SERVICES}
                className="group inline-flex items-center gap-2 py-3.5 text-sm font-semibold text-white/80 transition-colors hover:text-white"
              >
                Browse services
                <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="hero-in lg:col-span-6" style={d(260)}>
            <HeroJobCard />
          </div>
        </div>

        {/* quiet stats strip */}
        <div className="hero-in relative border-t border-white/[0.08]" style={d(700)}>
          <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-white/[0.08] px-4 sm:px-6 lg:px-8">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="py-5 pl-5 first:pl-0 sm:py-6 sm:pl-8">
                <div className="font-fraunces text-xl font-semibold sm:text-2xl">{s.value}</div>
                <div className="mt-0.5 text-[11px] text-white/45 sm:text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Journey steps                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="max-w-2xl">
            <Eyebrow>Three steps</Eyebrow>
            <h2 className="mt-5 font-fraunces text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              A clearer way to hire local help
            </h2>
            <p className="mt-4 text-base text-muted sm:text-lg">
              No endless calls. No price guessing. Just a protected path from request to done.
            </p>
          </ScrollReveal>

          <div className="mt-20 space-y-24 md:mt-28 md:space-y-32">
            {STEPS.map((step, index) => {
              const flipped = index % 2 === 1;
              return (
                <div
                  key={step.num}
                  className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16"
                >
                  <ScrollReveal
                    className={cn("lg:col-span-5", flipped && "lg:order-2")}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-fraunces text-sm font-semibold text-brand">{step.num}</span>
                      <span className="h-px w-10 bg-brand/40" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                        {step.tag}
                      </span>
                    </div>
                    <h3 className="mt-6 font-fraunces text-3xl font-semibold leading-tight text-ink md:text-[2.6rem]">
                      {step.title}
                    </h3>
                    <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
                      {step.desc}
                    </p>
                  </ScrollReveal>

                  <ScrollReveal
                    variant="up"
                    delay={120}
                    className={cn("lg:col-span-7", flipped && "lg:order-1")}
                  >
                    <div className="relative">
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-[radial-gradient(circle_at_50%_50%,rgba(199,10,36,0.08),transparent_70%)]"
                      />
                      <div className="relative">
                        <StepVisual type={step.visual} />
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Payment safety                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-ink py-24 text-white md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(199,10,36,0.3),transparent_55%)]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="max-w-2xl">
            <Eyebrow tone="dark">Zero upfront risk</Eyebrow>
            <h2 className="mt-5 font-fraunces text-4xl font-semibold tracking-tight md:text-5xl">
              Your payment stays protected the whole way
            </h2>
            <p className="mt-4 text-white/60 sm:text-lg">
              Automatic payment security built into every job — no awkward cash handoffs.
            </p>
          </ScrollReveal>

          <SafetyRail />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Comparison                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <Eyebrow className="justify-center">Before &amp; after</Eyebrow>
            <h2 className="mt-5 font-fraunces text-4xl font-semibold text-ink md:text-5xl">
              Old hiring vs NearServe
            </h2>
            <p className="mt-4 text-muted sm:text-lg">
              Same problem. Completely different experience.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="scale" delay={100} className="mt-16">
            <div className="glass-light grid overflow-hidden rounded-[2rem] md:grid-cols-2">
              <div className="bg-cream-deep/50 p-8 md:p-12">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                  The old way
                </div>
                <ul className="mt-8 space-y-5">
                  {COMPARISON.old.map((item) => (
                    <li key={item} className="flex items-start gap-4 text-base text-muted">
                      <X className="mt-0.5 h-5 w-5 shrink-0 text-muted/60" strokeWidth={1.75} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative p-8 md:border-l md:border-ink/[0.06] md:p-12">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(199,10,36,0.12),transparent_70%)]"
                />
                <div className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
                  The NearServe way
                </div>
                <ul className="relative mt-8 space-y-5">
                  {COMPARISON.next.map((item) => (
                    <li key={item} className="flex items-start gap-4 text-base font-semibold text-ink">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Proof + CTA                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="scale">
            <FinalCta />
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
