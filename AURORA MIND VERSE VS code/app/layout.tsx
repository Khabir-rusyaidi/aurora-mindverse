// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

// ✅ Optional metadata (shows on browser tab)
export const metadata: Metadata = {
  title: "Aurora Mind Verse – Step Into The New Era",
  description: "An interactive learning platform for IT students and teachers.",
};

// ✅ Root layout wrapper
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon / meta tags can be placed here */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen bg-[#7cc9f5] text-black antialiased">
        {/* ✅ The Tailwind classes above ensure consistent background + text */}
        {children}
      </body>
    </html>
  );
}
