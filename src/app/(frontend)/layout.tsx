import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "./components/ui/sonner";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Daramis Sales App",
  description: "Internal sales application for Daramis developer projects",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}