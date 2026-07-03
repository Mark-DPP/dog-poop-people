import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dog Poop People | Reliable Yard Cleanup",
  description:
    "Transparent, affordable dog waste removal with no contracts, no hidden fees, and reliable local service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/admin/login"
      signUpUrl="/admin/login"
      afterSignOutUrl="/admin/login"
      signInFallbackRedirectUrl="/admin/dashboard"
      signUpFallbackRedirectUrl="/admin/dashboard"
    >
      <html
        lang="en"
        className={`${plusJakartaSans.variable} ${manrope.variable} h-full scroll-smooth antialiased`}
        data-scroll-behavior="smooth"
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
