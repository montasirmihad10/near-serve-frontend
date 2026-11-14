"use client";

import Link from "next/link";
import { NAVBAR_CONFIG, ROUTES } from "@/utils/navigation";
import type { ReactNode } from "react";
import { ShieldCheck, Lock, Star } from "lucide-react";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  footer?: ReactNode;
};

export default function AuthShell({
  children,
  title,
  subtitle,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream">
      <div className="relative lg:w-[45%] xl:w-[42%] bg-ink text-white flex flex-col justify-between p-8 md:p-12 lg:min-h-screen overflow-hidden noise-overlay">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(199,10,36,0.42)_0%,transparent_55%)]" />
        <div className="absolute -bottom-16 -right-10 w-[28rem] h-[28rem] bg-brand/15 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute top-1/3 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link
            href={ROUTES.HOME}
            className="font-fraunces text-2xl font-bold tracking-tight inline-block transition-transform duration-300 hover:scale-[1.02]"
          >
            <span className="text-white">{NAVBAR_CONFIG.LOGO_TEXT}</span>
            <span className="text-brand">{NAVBAR_CONFIG.LOGO_HIGHLIGHT}</span>
          </Link>
        </div>

        <div className="relative z-10 my-10 lg:my-0 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 text-xs font-medium text-white/85 mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
            847 providers active now
          </div>
          <h1 className="font-fraunces text-3xl md:text-4xl xl:text-5xl font-semibold leading-[1.08] mb-4">
            Local pros.
            <br />
            <em className="not-italic text-brand">Competing</em> for
            <br />
            your job.
          </h1>
          <p className="text-white/65 text-sm md:text-base max-w-sm leading-relaxed">
            Create an account. Get bids from verified providers. Pay safely
            through secure payment hold until you&apos;re happy.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm">
            {[
              { val: "4,800+", label: "Jobs done", icon: Star },
              { val: "4.9★", label: "Avg rating", icon: ShieldCheck },
              { val: "100%", label: "Safe payment", icon: Lock },
            ].map((s, i) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/5 border border-white/10 px-3 py-3 backdrop-blur-sm animate-fade-up"
                style={{ animationDelay: `${120 + i * 80}ms` }}
              >
                <s.icon className="size-3.5 text-brand mb-2 opacity-80" />
                <div className="font-fraunces text-xl font-bold">{s.val}</div>
                <div className="text-[10px] text-white/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/30 hidden lg:block">
          © {new Date().getFullYear()} NearServe
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(199,10,36,0.05),transparent_45%)]" />
        <div className="w-full max-w-md relative z-10 animate-fade-up">
          <div className="mb-8">
            <h2 className="font-fraunces text-2xl md:text-3xl font-semibold text-ink">
              {title}
            </h2>
            <p className="text-muted text-sm mt-2 leading-relaxed">{subtitle}</p>
          </div>

          <div className="app-surface-solid p-6 md:p-8 shadow-[0_16px_48px_rgba(26,18,8,0.07)]">
            {children}
          </div>

          {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
