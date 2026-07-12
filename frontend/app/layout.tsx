import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OptiPrint AI - Intelligent Document Pre-Print Optimizer",
  description: "Reduce printing costs, paper, and carbon footprints by intelligently optimizing document spacing, whitespace, layout, and images before you print.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold tracking-tight">Opti<span className="text-optigreen-500">Print</span> AI</span>
              <span className="text-slate-600">|</span>
              <span className="text-xs">Saving trees, money, and time, page by page.</span>
            </div>
            <div className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} OptiPrint AI Platform. Production-ready foundation. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
