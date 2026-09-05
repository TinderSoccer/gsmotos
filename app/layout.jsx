import { Barlow_Condensed, Barlow } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-rajdhani",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata = {
  title: "GSmotos — Especialistas en BMW Motorrad",
  description:
    "Mantención, diagnóstico electrónico y preparación de performance para toda la gama BMW en Santiago, Chile.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${barlowCondensed.variable} ${barlow.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
