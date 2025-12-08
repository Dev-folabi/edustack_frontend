import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";
import AuthSync from "@/components/AuthSync";
import { AuthProvider } from "@/components/AuthProvider";
import ReactQueryProvider from "@/components/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduStack - Educational Platform",
  description:
    "A comprehensive educational platform for students and educators",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthSync />
        <ToastProvider>
          <AuthProvider>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
