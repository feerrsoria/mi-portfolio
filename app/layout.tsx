import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import NavBar from "./components/NavBar";
import RootStyleRegistry from "./RootStyleRegistry";
import { ClerkProvider } from "@clerk/nextjs";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fernando Soria | Full-Stack Developer",
  description: "Modern web and mobile applications portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <LanguageProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
            suppressHydrationWarning
          >
            <RootStyleRegistry>
              <NavBar />
              {children}
            </RootStyleRegistry>
          </body>
        </html>
      </LanguageProvider>
    </ClerkProvider>
  );
}
