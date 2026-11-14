"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthCta } from "@/hooks/useAuthCta";
import { registerHref } from "@/lib/auth/flow";
import { ROUTES } from "@/utils/navigation";
import { useGetPublicAnalyticsQuery } from "@/redux/api/analyticsApi";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Search,
  Lock,
  Zap,
} from "lucide-react";

const PROMPT_SUGGESTIONS = [
  "I need my bathroom tiled this weekend in Mirpur...",
  "Emergency AC servicing needed in Banani...",
  "Fix kitchen pipe leak & faucet replacement in Dhanmondi...",
  "Deep clean 3-bedroom apartment in Gulshan...",
  "Install 4 ceiling fans & switches in Uttara...",
];

export default function Hero() {
  const [searchValue, setSearchValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const { primary, role } = useAuthCta();
  const router = useRouter();
  const { data: analyticsData } = useGetPublicAnalyticsQuery({});
  const activeProvidersCount =
    analyticsData?.data?.activeProviders || 847;

  // Cycling placeholder text for dynamic plain-language feel
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PROMPT_SUGGESTIONS.length);
        setIsTyping(true);
      }, 400);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (!searchValue.trim()) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("post_job_draft", searchValue.trim());
    }
    if (role === "customer") {
      router.push(ROUTES.CUSTOMER_POST_JOB);
      return;
    }
    if (role === "provider") {
      router.push(ROUTES.PROVIDER_HOME);
      return;
    }
    router.push(
      registerHref({
        role: "customer",
        intent: "hire",
        returnUrl: ROUTES.CUSTOMER_POST_JOB,
      }),
    );
  };

  return (
    <div className="relative bg-[#FAF6EF] overflow-hidden pt-24 pb-16 md:pt-28 md:pb-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[28rem] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(199,10,36,0.1),transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-[radial-gradient(circle,rgba(232,221,208,0.55),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[calc(90vh-80px)]">
          
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2.5 bg-white border border-border/70 rounded-full pl-2.5 pr-4 py-1.5 text-xs font-semibold text-[#4a3728] shadow-sm w-fit animate-fade-up">
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="tracking-wide">
                <strong className="text-[#1a1208] font-bold">
                  {Number(activeProvidersCount).toLocaleString()} verified providers
                </strong>{" "}
                active in Dhaka
              </span>
            </div>

            <h1 className="font-fraunces text-4xl sm:text-5xl lg:text-[56px] font-semibold leading-[1.08] tracking-[-1.5px] text-[#1a1208] animate-fade-up hero-delay-1">
              Real locals.{" "}
              <span className="relative inline-block text-[#C70A24] italic font-normal">
                Competing
                <svg
                  className="absolute left-0 -bottom-1 w-full text-[#C70A24]/30"
                  height="8"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,5 Q50,0 100,5"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>
              </span>{" "}
              for your job.
            </h1>

            <p className="text-base sm:text-lg leading-[1.65] text-[#6b5244] max-w-xl animate-fade-up hero-delay-2">
              Describe what you need in simple words. Nearby verified experts send you their best offers.{" "}
              <strong className="text-[#1a1208] font-semibold">
                You only pay after the job is done and you are 100% happy.
              </strong>
            </p>

            <div className="flex flex-col gap-2.5 pt-1 animate-fade-up hero-delay-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
              <Link
                href={primary.href}
                className="app-btn group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-brand px-7 py-3.5 text-[15px] font-bold text-white shadow-[0_10px_28px_rgba(199,10,36,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_14px_34px_rgba(199,10,36,0.4)] sm:w-auto"
              >
                <span>{primary.label}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href={
                  role === "guest"
                    ? ROUTES.SERVICES
                    : role === "customer"
                      ? ROUTES.CUSTOMER_HOME
                      : ROUTES.PROVIDER_HOME
                }
                className="app-btn flex w-full items-center justify-center rounded-full border border-ink/12 bg-white px-6 py-3.5 text-[15px] font-bold text-ink shadow-sm transition-all duration-300 hover:border-brand/35 hover:text-brand sm:w-auto"
              >
                {role === "guest"
                  ? "Explore services"
                  : role === "customer"
                    ? "My active jobs"
                    : "Job feed"}
              </Link>
            </div>

            <div className="pt-2 max-w-xl animate-fade-up hero-delay-4">
              <div className="group rounded-2xl border border-border/80 bg-white/85 p-2 shadow-[0_8px_28px_rgba(26,18,8,0.05)] transition-all duration-300 hover:bg-white focus-within:!bg-white focus-within:shadow-[0_12px_36px_rgba(26,18,8,0.08)] sm:p-2.5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 sm:px-2">
                  <div className="flex min-w-0 flex-1 items-center gap-3 px-2 sm:px-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-cream text-[#C70A24]">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      className="w-full border-none bg-transparent text-sm text-[#1a1208] outline-none placeholder:text-[#9b8270]/80 placeholder:transition-opacity placeholder:duration-300 sm:text-base"
                      placeholder={
                        isTyping
                          ? PROMPT_SUGGESTIONS[placeholderIndex]
                          : "Describe any home service or repair..."
                      }
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#1a1208] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-[#C70A24] sm:w-auto sm:px-5 sm:py-2.5 sm:text-xs"
                  >
                    <span>Find Pros</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#9b8270] mt-2 px-2">
                <span>AI matches local experts in under 4 minutes</span>
                <span className="hidden sm:inline font-medium text-[#6b5244]">100% Free to post</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 max-w-xl animate-fade-up hero-delay-5">
              <div className="flex items-center gap-2 p-2.5 bg-white border border-border/60 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] leading-tight font-medium text-[#4a3728]">
                  <strong className="block text-[#1a1208] font-semibold">Payment Safe</strong>
                  Pay after work
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-white border border-border/60 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] leading-tight font-medium text-[#4a3728]">
                  <strong className="block text-[#1a1208] font-semibold">Admin Vetted</strong>
                  ID & skill checked
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-white border border-border/60 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] leading-tight font-medium text-[#4a3728]">
                  <strong className="block text-[#1a1208] font-semibold">Trust Ratings</strong>
                  Verified reviews
                </div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-6 flex items-center justify-center relative min-h-[480px] sm:min-h-[540px] animate-scale-in hero-delay-2">
            <div className="relative w-[22rem] sm:w-[28rem] h-[22rem] sm:h-[28rem] flex items-center justify-center">
              <div className="absolute w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(199,10,36,0.14)_0%,transparent_70%)]" />
              <div className="absolute rounded-full border border-dashed border-brand/20 w-52 h-52 sm:w-56 sm:h-56" />
              <div className="absolute rounded-full border border-dashed border-brand/15 w-80 h-80 sm:w-[22rem] sm:h-[22rem] animate-spin-slow" />
              <div className="absolute rounded-full border border-dashed border-brand/10 w-[26rem] h-[26rem] hidden sm:block" />

              <div className="absolute z-20 bg-white border border-border/70 rounded-3xl px-6 py-5 flex flex-col items-center gap-1 shadow-[0_16px_40px_rgba(26,18,8,0.1)]">
                <div className="font-fraunces text-3xl sm:text-4xl font-bold text-ink leading-none">
                  4,800+
                </div>
                <div className="text-[11px] font-bold text-muted uppercase tracking-[0.5px]">
                  Jobs Completed
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                  100% Protected
                </div>
              </div>

              {[
                { name: "Ahmed", initials: "AK", rating: "4.9", color: "bg-brand", pos: "top-2 left-1/2 -translate-x-1/2" },
                { name: "Sara", initials: "SR", rating: "4.8", color: "bg-[#7c3aed]", pos: "bottom-4 left-1/2 -translate-x-1/2" },
                { name: "Karim", initials: "KM", rating: "5.0", color: "bg-emerald-600", pos: "top-1/2 -translate-y-1/2 left-0" },
                { name: "Nadia", initials: "NI", rating: "4.7", color: "bg-amber-600", pos: "top-1/2 -translate-y-1/2 right-0" },
                { name: "Tariq", initials: "TH", rating: "4.9", color: "bg-cyan-600", pos: "top-16 right-6 sm:right-2" },
                { name: "Rina", initials: "RA", rating: "4.6", color: "bg-rose-700", pos: "bottom-16 left-6 sm:left-2" },
              ].map((p, i) => (
                <div
                  key={p.name}
                  className={`absolute z-10 ${p.pos} ${i % 2 === 0 ? "animate-float-slow" : ""}`}
                  style={i % 2 === 0 ? { animationDelay: `${i * 0.4}s` } : undefined}
                >
                  <div className="w-[72px] h-[72px] rounded-full bg-white border border-border/60 shadow-[0_10px_24px_rgba(26,18,8,0.1)] flex flex-col items-center justify-center gap-0.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${p.color}`}>
                      {p.initials}
                    </div>
                    <div className="text-[10px] font-bold text-ink leading-none">{p.name}</div>
                    <div className="text-[9px] text-muted font-semibold">★ {p.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
