import type { Metadata } from "next";
import "./globals.css";

const description =
  "Turn everyday receipts into organized records you can review, categorize, and export.";

export const metadata: Metadata = {
  metadataBase: new URL("https://deduxis.vercel.app"),
  title: {
    default: "Deduxis — Every receipt. Everything in order.",
    template: "%s · Deduxis",
  },
  description,
  applicationName: "Deduxis",
  icons: {
    icon: [
      { url: "/brand/favicon.ico" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: "Deduxis",
    title: "Deduxis — Every receipt. Everything in order.",
    description,
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Deduxis. Every receipt. Everything in order.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deduxis — Every receipt. Everything in order.",
    description,
    images: ["/brand/og-image.png"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
