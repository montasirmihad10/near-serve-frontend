"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "antd";
import { toast } from "sonner";
import UseForm from "@/components/ui/UseForm";
import UseInput from "@/components/ui/UseInput";
import AuthShell from "@/components/auth/AuthShell";
import { handleLoginSuccess } from "@/lib/auth/auth.handlers";
import { extractAccessToken, getApiErrorMessage } from "@/lib/auth/auth.utils";
import { decodeJwt } from "@/utils/jwt";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { useLoginUserMutation } from "@/redux/api/authApi";
import { ROLE_REDIRECT, ROUTES } from "@/utils/navigation";
import type { DemoRole } from "@/lib/auth/demoAuth";
import { useDemoAuth } from "@/components/providers/DemoAuthProvider";
import { baseApi } from "@/redux/api/baseApi";
import { useDispatch } from "react-redux";
import { getSocket, resetSocket } from "@/lib/socket";
import {
  normalizeAuthRole,
  registerHref,
  sanitizeReturnUrl,
} from "@/lib/auth/flow";
import { getFcmToken } from "@/hooks/useFcmToken";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { applyRole } = useDemoAuth();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const returnUrl = sanitizeReturnUrl(searchParams.get("returnUrl"));

  const onSubmit = async (values: LoginFormValues) => {
    try {
      // Request notification permission + device token before login so backend can $addToSet it
      const fcmToken = await getFcmToken();
      const res = await loginUser({
        ...values,
        ...(fcmToken ? { fcmToken } : {}),
      }).unwrap();
      const token = extractAccessToken(res);

      if (!token) {
        toast.error("Login succeeded but no token was returned.");
        return;
      }

      handleLoginSuccess(token);

      const payload = decodeJwt(token);
      const roleKey = (normalizeAuthRole(payload?.role) ||
        "customer") as DemoRole;
      if (
        roleKey === "customer" ||
        roleKey === "provider" ||
        roleKey === "admin"
      ) {
        applyRole(roleKey);
      }

      dispatch(baseApi.util.resetApiState());
      resetSocket();
      const socket = getSocket();
      socket.auth = { token };
      socket.connect();

      toast.success("Welcome back!");

      const roleHome =
        ROLE_REDIRECT[roleKey as keyof typeof ROLE_REDIRECT] ??
        ROUTES.CUSTOMER_HOME;

      // Only continue into a returnUrl that matches this role's workspace
      const returnMatchesRole =
        Boolean(returnUrl) &&
        ((roleKey === "customer" && returnUrl!.startsWith("/customer")) ||
          (roleKey === "provider" && returnUrl!.startsWith("/provider")) ||
          (roleKey === "admin" && returnUrl!.startsWith("/admin")));

      router.push(returnMatchesRole && returnUrl ? returnUrl : roleHome);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid email or password"));
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your jobs, bids, and messages."
      footer={
        <>
          <span className="text-muted">Don&apos;t have an account? </span>
          <Link
            href={registerHref({
              returnUrl,
              role: searchParams.get("role") === "provider" ? "provider" : "customer",
            })}
            className="font-semibold text-brand hover:underline"
          >
            Sign up
          </Link>
        </>
      }
    >
      <UseForm
        onSubmit={onSubmit}
        resolver={zodResolver(loginSchema)}
        defaultValues={{ email: "", password: "" }}
      >
        <div className="space-y-4">
          <UseInput
            name="email"
            label="Email"
            type="email"
            placeholder="you@email.com"
          />
          <UseInput
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
          />
          <div className="flex justify-end">
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            htmlType="submit"
            type="primary"
            loading={isLoading}
            block
            size="large"
            className="!h-12 !rounded-full !border-0 !bg-brand !font-bold hover:!bg-brand-dark"
          >
            Log in
          </Button>
        </div>
      </UseForm>
    </AuthShell>
  );
}
