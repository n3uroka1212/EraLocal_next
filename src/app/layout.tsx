import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LocationProvider } from "@/providers/LocationProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { CookieBanner } from "@/components/ui/CookieBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EraLocal — Commerce local",
  description:
    "Plateforme SaaS pour le commerce local : vitrine, catalogue, Click & Collect",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("eralocal_theme")?.value;
  const initialTheme =
    themeCookie === "light" || themeCookie === "dark" ? themeCookie : undefined;

  return (
    <html
      lang="fr"
      data-theme={initialTheme ?? "dark"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider session={session}>
          <ThemeProvider initialTheme={initialTheme}>
            <LocationProvider>
              <ToastProvider>{children}</ToastProvider>
            </LocationProvider>
            <CookieBanner />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
