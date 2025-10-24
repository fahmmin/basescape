import type { Metadata } from "next";
import "./globals.css";
import { ProvidersAndLayout } from "@/components/ProvidersAndLayout";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Culture Drops - Share & Discover Places",
  description: "Share your favorite places with the world. Culture Drops stores images on Walrus and connects communities through place-based stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ProvidersAndLayout>
          {children}
          <Analytics />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0C0F1D',
                color: '#F7F7F7',
                border: '2px solid #97F0E5',
              },
            }}
          />
        </ProvidersAndLayout>
      </body>
    </html>
  );
}
