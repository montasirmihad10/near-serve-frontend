import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/auth.config";

/**
 * Next.js 16+: `proxy.ts` replaces deprecated `middleware.ts`.
 * Runs on Node.js runtime. Guards role workspaces; public marketing routes stay open.
 */
function decodeJwtPayload(
  token: string,
): { role?: string; exp?: number } | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const json = atob(padded);
    return JSON.parse(json) as { role?: string; exp?: number };
  } catch {
    return null;
  }
}

function isExpired(payload: { exp?: number } | null) {
  if (!payload?.exp) return false;
  return payload.exp * 1000 < Date.now();
}

function loginRedirect(req: NextRequest, returnPath: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("returnUrl", returnPath);
  return NextResponse.redirect(url);
}

function homeForRole(role: string | undefined) {
  if (role === "provider") return "/provider";
  if (role === "admin" || role === "super_admin") return "/admin";
  if (role === "customer" || role === "user") return "/customer";
  return "/";
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_CONFIG.TOKEN_COOKIE_KEY)?.value;
  const payload = token ? decodeJwtPayload(token) : null;
  const authed = Boolean(token && payload && !isExpired(payload));
  const role = payload?.role;

  // Public marketing + assets: never force login (first-visit friendly)
  const isCustomer =
    pathname === "/customer" || pathname.startsWith("/customer/");
  const isProvider =
    pathname === "/provider" || pathname.startsWith("/provider/");
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-otp" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isCustomer || isProvider || isAdmin) {
    if (!authed) {
      return loginRedirect(req, `${pathname}${req.nextUrl.search}`);
    }

    const normalized =
      role === "user"
        ? "customer"
        : role === "super_admin"
          ? "admin"
          : role;

    if (isCustomer && normalized !== "customer") {
      return NextResponse.redirect(new URL(homeForRole(role), req.url));
    }
    if (isProvider && normalized !== "provider") {
      return NextResponse.redirect(new URL(homeForRole(role), req.url));
    }
    if (isAdmin && normalized !== "admin" && role !== "super_admin") {
      return NextResponse.redirect(new URL(homeForRole(role), req.url));
    }
  }

  // Authed users on auth pages → continue to intended action or role home
  if (isAuthPage && authed) {
    const returnUrl = req.nextUrl.searchParams.get("returnUrl");
    if (
      returnUrl &&
      returnUrl.startsWith("/") &&
      !returnUrl.startsWith("//") &&
      !returnUrl.startsWith("/login") &&
      !returnUrl.startsWith("/register")
    ) {
      return NextResponse.redirect(new URL(returnUrl, req.url));
    }
    return NextResponse.redirect(new URL(homeForRole(role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/customer/:path*",
    "/provider/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
  ],
};
