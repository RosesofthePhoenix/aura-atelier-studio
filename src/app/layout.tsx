import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://auraatelier.studio"),
  title: "Aura Atelier by V",
  description:
    "Atelier privado del Altiplano. Piezas con aura, por invitación.",
  openGraph: {
    title: "Aura Atelier by V",
    description:
      "Un atelier privado donde la presencia se teje en silencio.",
    url: "https://auraatelier.studio",
    siteName: "Aura Atelier by V",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
