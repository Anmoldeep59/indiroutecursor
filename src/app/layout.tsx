import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "IndiRoute — Shop Indian Stores & Ship Internationally",
    template: "%s · IndiRoute",
  },
  description:
    "Sign up for an Indian address. Shop your favourite Indian stores and ship internationally. Beta: India → Australia.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://indiroute.co"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
