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
  title: "Sidejob | Creative Production Agency in Oslo",
  description:
    "Sidejob is an independent creative production agency in Oslo, building specialist teams for campaigns, film, photography, content and experiences.",
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

