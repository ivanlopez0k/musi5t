import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={khTeka.variable}>
      <body className={`${khTeka.className} min-h-full flex flex-col font-sans`}>
        {children}
      </body>
    </html>
  );
}

