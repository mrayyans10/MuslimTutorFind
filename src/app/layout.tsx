import type { Metadata } from "next";
import { DM_Sans, Source_Serif_4 } from "next/font/google";
import { Toaster } from "sonner";

import {
  PRODUCT_DESCRIPTION,
  PRODUCT_NAME,
  PRODUCT_TAGLINE,
} from "@config/product";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: PRODUCT_NAME,
    template: `%s | ${PRODUCT_NAME}`,
  },
  description: PRODUCT_DESCRIPTION,
  applicationName: PRODUCT_NAME,
  openGraph: {
    title: PRODUCT_NAME,
    description: PRODUCT_TAGLINE,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${sourceSerif.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast:
                "border border-border bg-card text-card-foreground shadow-lg",
              title: "font-medium",
              description: "text-muted-foreground",
            },
          }}
        />
      </body>
    </html>
  );
}
