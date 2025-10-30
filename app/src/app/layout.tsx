import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "tunebox",
  description: "Music app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <div className="max-w-3xl mx-auto p-6">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
