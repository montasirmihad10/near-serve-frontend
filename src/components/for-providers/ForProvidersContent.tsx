"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import ProviderHeroVisual from "@/components/shared/hero/ProviderHeroVisual";
import { useCountUp } from "@/hooks/useCountUp";
import { useInView } from "@/hooks/useInView";
import { ROUTES } from "@/utils/navigation";
import {
  UserCheck,
  MapPin,
  Zap,
  Wallet,
  ShieldCheck,
  Star,
  Trophy,
  ArrowRight,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const PROVIDER_STEPS = [
  {
    num: "01",
    title: "Create your profile",
    desc: "List your skills, service area, and experience. Get verified with a trust badge that wins more client jobs.",
    icon: UserCheck,
  },
  {
    num: "02",
    title: "Get matched to nearby jobs",
    desc: "Our smart engine sends you relevant jobs in your neighborhood — no cold calls, no expensive advertising.",
    icon: MapPin,
  },
  {
    num: "03",
    title: "Submit competitive bids",
    desc: "Set your own price and schedule. Clients compare your verified trust score, reviews, and offer side by side.",
    icon: Zap,
  },
  {
    num: "04",
    title: "Complete the job. Get paid.",
    desc: "Customer pre-funds the job upfront. Once you finish and they approve, funds transfer immediately to you.",
    icon: Wallet,
  },
];

const BENEFITS = [
  {
    icon: MapPin,
    title: "Jobs in your neighborhood",
    desc: "Location-based matching keeps travel time minimal so you can take more jobs daily.",
  },
  {
    icon: DollarSign,
    title: "You set your own rates",
    desc: "Bid what your time and expertise are worth with complete pricing freedom.",
  },
  {
    icon: ShieldCheck,
    title: "Guaranteed payment safety",
    desc: "Jobs are pre-funded before you start. Zero chasing late invoices or unpaid balances.",
  },
  {
    icon: Star,
    title: "Growing reputation score",
    desc: "Every completed job and verified review increases your rank and leads to better requests.",
  },
  {
    icon: CheckCircle2,
    title: "Verified pro badge",
    desc: "Stand out from unregistered competition with an official NearServe verification badge.",
  },
  {
    icon: Trophy,
    title: "Leaderboard rewards",
    desc: "Top performers get priority placement, platform badges, and bonus exposure to clients.",
  },
];

const TESTIMONIALS = [
  {
    name: "Tariq H.",
    role: "Master Electrician · Gulshan",
    text: "I filled my entire week in 2 days. The job feed sends requests straight to my phone — I just submit my quote and start working.",
    rating: 5,
    initial: "TH",
  },
  {
    name: "Nadia I.",
    role: "Interior Painter · Mirpur",
    text: "Protected payments changed everything for my business. I never chase money anymore. Customer approves, funds hit my account right away.",
    rating: 5,
    initial: "NI",
  },
];

const REQUIREMENTS = [
  "Valid Government National ID for identity verification",
  "Proven skills & selected service categories",
  "Service coverage area mapped to your neighborhood",
  "Quick admin approval within 24–48 hours",
];

function StatsBar() {
  const { ref, inView } = useInView();
  const jobs = useCountUp(1240, inView);
  const providers = useCountUp(847, inView);
  const earned = useCountUp(48, inView);

  return (
    <div
      ref={ref}
      className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8 md:gap-8"
    >
      {[
        { value: jobs, suffix: "+", label: "Active jobs this week" },
        { value: providers, suffix: "", label: "Providers online now" },
        { value: earned, suffix: "k+", label: "Avg. monthly earnings (৳)" },
      ].map((stat) => (
        <div key={stat.label} className="text-center sm:text-left">
          <div className="font-fraunces text-2xl font-bold tracking-tight text-white md:text-4xl">
            {stat.value.toLocaleString()}
            {stat.suffix}
          </div>
          <div className="mt-1 text-[11px] font-medium text-white/55 md:text-xs">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function JobFeedMock() {
  const [bidPlaced, setBidPlaced] = useState(false);

  return (
    <div className="glass-light overflow-hidden rounded-[1.75rem] p-6">
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-sm font-bold text-ink">Live Job Feed</span>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          12 new in your area
        </span>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand/20">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-bold text-ink">
                Bathroom tiling & fixtures
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <MapPin className="h-3 w-3 text-brand" />
                Mirpur, Section 10 · Posted 8 min ago
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
              3 bids
            </span>
          </div>

          <p className="mb-4 rounded-xl bg-cream px-3 py-2.5 text-xs leading-relaxed text-muted">
            Need 40 sq ft tiled this weekend with fixture replacement. Client supplies the tiles.
          </p>

          {!bidPlaced ? (
            <button
              type="button"
              onClick={() => setBidPlaced(true)}
              className="app-btn flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark"
            >
              Submit your bid — ৳8,500
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Bid submitted: ৳8,500 · 2 days
              </div>
              <button
                type="button"
                onClick={() => setBidPlaced(false)}
                className="text-[11px] text-stone-500 underline hover:text-stone-800"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {[
          { title: "AC chemical servicing", loc: "Dhanmondi · 1.5 km", bids: 5, budget: "৳2,800" },
          { title: "Full apartment electrical wiring", loc: "Gulshan · 3.2 km", bids: 2, budget: "৳15,000" },
        ].map((job) => (
          <div
            key={job.title}
            className="flex items-center justify-between rounded-xl bg-cream/80 px-4 py-3.5 transition-colors hover:bg-cream"
          >
            <div>
              <div className="text-sm font-semibold text-ink">{job.title}</div>
              <div className="mt-0.5 text-xs text-muted">{job.loc}</div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-ink">{job.budget}</span>
              <div className="text-[11px] text-muted">{job.bids} offers</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ForProvidersContent() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-cream">
      <section className="relative overflow-hidden bg-ink px-6 pb-20 pt-28 text-white md:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(199,10,36,0.32)_0%,transparent_55%)]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(199,10,36,0.14),transparent_70%)]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <div>
            <div className="hero-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-1.5 text-xs font-semibold text-white/85">
              <span className="live-dot" />
              840+ verified providers active & earning
            </div>

            <h1
              className="hero-in font-fraunces text-4xl font-semibold leading-[1.06] tracking-tight md:text-6xl"
              style={d(100)}
            >
              Your skills.
              <br />
              <em className="not-italic text-brand">Local jobs.</em>
              <br />
              Guaranteed pay.
            </h1>

            <p
              className="hero-in mt-5 max-w-xl text-lg leading-relaxed text-white/65"
              style={d(180)}
            >
              Stop waiting around for calls. Real clients send jobs directly to you.
              Quote on your terms, win fairly, and receive direct payments upon completion.
            </p>

            <div className="hero-in mt-8 flex flex-wrap gap-3" style={d(260)}>
              <Link
                href={`${ROUTES.REGISTER}?role=provider&intent=offer&returnUrl=${encodeURIComponent(ROUTES.PROVIDER_ONBOARDING)}`}
                className="app-btn inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-sm font-bold text-white shadow-[0_12px_32px_rgba(199,10,36,0.3)] hover:bg-brand-dark"
              >
                Join as a verified provider
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={ROUTES.HOW_IT_WORKS}
                className="app-btn rounded-full border border-white/15 bg-white/8 px-6 py-4 text-sm font-semibold text-white/85 hover:bg-white/12"
              >
                Need a service instead?
              </Link>
            </div>

            <div className="hidden md:block">
              <StatsBar />
            </div>
          </div>

          <div className="hero-in" style={d(220)}>
            <ProviderHeroVisual />
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-10 max-w-7xl md:hidden">
          <StatsBar />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <ScrollReveal className="mb-14 text-center">
          <span className="mb-3 inline-flex items-center rounded-full border border-border/80 bg-white px-3.5 py-1 text-xs font-semibold text-warm">
            Fast onboarding
          </span>
          <h2 className="font-fraunces text-3xl font-semibold text-ink md:text-5xl">
            Start earning in 4 simple steps
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-muted">
            From quick sign-up to your first direct payout
          </p>
        </ScrollReveal>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PROVIDER_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.num} delay={i * 80}>
                <div className="glass-light group flex h-full flex-col justify-between rounded-[1.5rem] p-6 transition-transform duration-400 hover:-translate-y-1">
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand transition-transform duration-300 group-hover:scale-105">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-fraunces text-3xl font-bold text-brand/20 transition-colors group-hover:text-brand/40">
                        {step.num}
                      </span>
                    </div>
                    <h3 className="mb-2 font-fraunces text-xl font-semibold text-ink">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f7f1e8_0%,#faf6ef_100%)] px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <div>
              <span className="mb-4 inline-flex items-center rounded-full border border-border/80 bg-white px-3.5 py-1 text-xs font-semibold text-warm">
                Active client demand
              </span>
              <h2 className="mb-4 font-fraunces text-3xl font-semibold leading-tight text-ink md:text-4xl">
                Jobs come directly to you
              </h2>
              <p className="mb-8 text-base leading-relaxed text-muted">
                Open your feed anytime, view local requests matched to your trade, and
                submit competitive bids in seconds. No advertising fees, no cold calling.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {BENEFITS.slice(0, 4).map((b) => {
                  const Icon = b.icon;
                  return (
                    <div
                      key={b.title}
                      className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 shadow-[inset_0_0_0_1px_rgba(26,18,8,0.05)]"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-ink">{b.title}</div>
                        <div className="mt-1 text-xs leading-snug text-muted">{b.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <JobFeedMock />
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <ScrollReveal className="mb-14 text-center">
          <span className="mb-3 inline-flex items-center rounded-full border border-border/80 bg-white px-3.5 py-1 text-xs font-semibold text-warm">
            Why partner with us
          </span>
          <h2 className="font-fraunces text-3xl font-semibold text-ink md:text-5xl">
            Why top professionals choose NearServe
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-muted">
            Everything you need to build a consistent, high-earning service business
          </p>
        </ScrollReveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <ScrollReveal key={b.title} delay={i * 60}>
                <div className="glass-light h-full rounded-[1.5rem] p-7 transition-transform duration-400 hover:-translate-y-1">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-fraunces text-xl font-semibold text-ink">
                    {b.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">{b.desc}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        <ScrollReveal className="mb-12 text-center">
          <span className="mb-3 inline-flex items-center rounded-full border border-border/80 bg-white px-3.5 py-1 text-xs font-semibold text-warm">
            Provider stories
          </span>
          <h2 className="font-fraunces text-3xl font-semibold text-ink md:text-4xl">
            Hear from our top earning pros
          </h2>
        </ScrollReveal>

        <div className="grid gap-5 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 100}>
              <div className="glass-light flex h-full flex-col justify-between rounded-[1.5rem] p-8">
                <div>
                  <div className="mb-4 flex items-center gap-1 text-amber-500">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="mb-6 text-base font-medium leading-relaxed text-ink">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3.5 border-t border-border/70 pt-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {t.initial}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-ink">{t.name}</div>
                    <div className="text-xs font-medium text-muted">{t.role}</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        <ScrollReveal>
          <div className="grid items-center gap-8 rounded-[2rem] bg-ink p-10 text-white shadow-[0_28px_60px_-28px_rgba(26,18,8,0.45)] md:grid-cols-2 md:p-14">
            <div>
              <span className="mb-4 inline-flex items-center rounded-full border border-white/12 bg-white/8 px-3.5 py-1 text-xs font-semibold text-white/75">
                Verified quality standard
              </span>
              <h2 className="mb-3 font-fraunces text-2xl font-semibold leading-tight md:text-4xl">
                Getting approved is fast & straightforward
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-white/65">
                We review each applicant to keep the marketplace trustworthy for customers
                and ensure steady, fair earnings for dedicated professionals.
              </p>
            </div>
            <ul className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              {REQUIREMENTS.map((req) => (
                <li
                  key={req}
                  className="flex items-center gap-3 text-sm font-medium text-white/90"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 font-fraunces text-3xl font-semibold text-ink md:text-5xl">
              Ready to grow your local service business?
            </h2>
            <p className="mb-8 text-base leading-relaxed text-muted">
              Create your provider profile in 5 minutes. Start receiving and bidding on
              jobs in your neighborhood within 24 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={`${ROUTES.REGISTER}?role=provider&intent=offer&returnUrl=${encodeURIComponent(ROUTES.PROVIDER_ONBOARDING)}`}
                className="app-btn inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 font-bold text-white shadow-[0_12px_32px_rgba(199,10,36,0.28)] hover:bg-brand-dark"
              >
                Join as a provider
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={ROUTES.HOW_IT_WORKS}
                className="app-btn rounded-full border border-border bg-white px-8 py-4 font-semibold text-ink hover:bg-cream"
              >
                How it works for clients
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
