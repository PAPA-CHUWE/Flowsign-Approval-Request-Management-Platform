import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, DM_Serif_Display } from "next/font/google";
import "aos/dist/aos.css";
import "lenis/dist/lenis.css";
import { ButtonToTop } from "@/components/layout/ButtonToTop";
import { Providers } from "@/components/layout/Providers";
import { ScrollAnimations } from "@/components/layout/ScrollAnimations";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flowsign",
  description: "Approval and request management for governed teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-lenis-prevent
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <SmoothScroll>
            <ScrollAnimations>
              {children}
            </ScrollAnimations>
          </SmoothScroll>
          <ButtonToTop />
        </Providers>
      </body>
    </html>
  );
}
