import { Rajdhani, Inter } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
});

const inter = Inter({
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
    <html lang="es" className={`${rajdhani.variable} ${inter.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
