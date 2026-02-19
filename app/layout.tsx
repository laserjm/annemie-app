import type { Metadata, Viewport } from "next";
import { Baloo_2, Comic_Neue } from "next/font/google";
import "./globals.css";

const baloo2 = Baloo_2({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const comicNeue = Comic_Neue({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Annemie — Math Fun!",
  description: "A playful math game for kids aged 6–8",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Annemie",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${baloo2.variable} ${comicNeue.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
