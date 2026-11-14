"use client";

import { useEffect, useRef } from "react";
import { onMessage, Unsubscribe } from "firebase/messaging";
import { toast } from "sonner";
import { getMessagingInstance } from "@/lib/firebase/firebase";
import { getFcmToken } from "@/hooks/useFcmToken";
import { getClientToken } from "@/lib/auth/cookies.client";
import { useSaveFcmTokenMutation } from "@/redux/api/authApi";

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [saveFcmToken] = useSaveFcmTokenMutation();
  const syncedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    let cancelled = false;

    const setupListener = async () => {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator)) return;

      try {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          scope: "/",
        });
        await navigator.serviceWorker.ready;

        const messaging = await getMessagingInstance();
        if (!messaging || cancelled) return;

        // If already logged in (refresh / demo session), keep FCM token registered
        const accessToken = getClientToken();
        if (accessToken) {
          const fcmToken = await getFcmToken();
          if (
            fcmToken &&
            !cancelled &&
            syncedTokenRef.current !== fcmToken
          ) {
            try {
              await saveFcmToken(fcmToken).unwrap();
              syncedTokenRef.current = fcmToken;
            } catch (err) {
              console.error("Failed to sync FCM token:", err);
            }
          }
        }

        unsubscribe = onMessage(messaging, (payload) => {
          const title = payload.notification?.title || "New notification";
          const body = payload.notification?.body || "";
          const jobId = payload.data?.jobId as string | undefined;
          const conversationId = payload.data?.conversationId as
            | string
            | undefined;

          toast(title, {
            description: body,
            duration: 5000,
            position: "top-center",
          });

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            const notification = new Notification(title, {
              body,
              icon: "/notification-icon.svg",
              badge: "/notification-icon.svg",
              tag: conversationId || jobId || "notification",
            });

            notification.onclick = () => {
              window.focus();
              if (conversationId) {
                window.location.href = `/customer/messages?id=${conversationId}`;
              } else if (jobId) {
                window.location.href = `/customer/jobs/${jobId}`;
              }
              notification.close();
            };
          }
        });
      } catch (err) {
        console.error("FCM listener setup failed:", err);
      }
    };

    void setupListener();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [saveFcmToken]);

  return <>{children}</>;
};

export default NotificationProvider;
