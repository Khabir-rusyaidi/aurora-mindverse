// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Aurora Mind Verse",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
