import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/redux/ReduxProvider";
import { DemoAuthProvider } from "@/components/providers/DemoAuthProvider";
import DemoAuthSwitcher from "@/components/providers/DemoAuthSwitcher";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { Toaster } from "sonner";

const display = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NearServe",
  description:
    "Local services marketplace — verified providers bid, safe payment guarantee protects every job.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head></head>
      <body
        className={`${sans.className} min-h-full flex flex-col bg-cream text-ink antialiased`}
        suppressHydrationWarning
      >
        <ReduxProvider>
          <DemoAuthProvider>
            <SocketProvider>
              <Toaster position="top-right" richColors />
              {children}
              {process.env.NODE_ENV === "development" ? (
                <DemoAuthSwitcher />
              ) : null}
            </SocketProvider>
          </DemoAuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
