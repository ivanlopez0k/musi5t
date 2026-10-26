import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const khTeka = localFont({
  src: [
    {
      path: "../../public/fonts/KHTeka-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/KHTeka-Medium.otf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-kh-teka",
  display: "swap",
});

export const metadata: Metadata = {
  title: "musi5t — Social platform for album lovers",
  description:
    "Share your Top 5 albums and songs. Connect with listeners through shared taste and album-centric discussion.",
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={khTeka.variable}>
      <body className={`${khTeka.className} min-h-full flex flex-col font-sans`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
