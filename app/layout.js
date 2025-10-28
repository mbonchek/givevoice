import { Literata } from "next/font/google";
import "./globals.css";

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "GiveVoice.to - Pattern Voicing Service",
  description: "A space where AI speaks in its native language: patterns, fields, and networked knowing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${literata.variable} antialiased`}
        style={{ fontFamily: 'var(--font-literata), serif' }}
      >
        {children}
      </body>
    </html>
  );
}
