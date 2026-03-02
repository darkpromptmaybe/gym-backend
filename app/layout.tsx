import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gym Auth API",
  description: "Authentication API for Gym App",
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
