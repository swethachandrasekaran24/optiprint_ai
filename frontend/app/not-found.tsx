"use client";

import Link from "next/link";
import { Printer, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-md space-y-6 bg-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden">
        {/* Decorative corner circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-optigreen-50 rounded-full translate-x-12 -translate-y-12 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-optiblue-50 rounded-full -translate-x-12 translate-y-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex p-4 bg-gradient-to-tr from-optiblue-600 to-optigreen-500 rounded-3xl text-white shadow-lg shadow-optiblue-100 mb-6">
            <Printer className="h-10 w-10 animate-bounce" />
          </div>

          <h1 className="text-6xl font-black text-slate-800 tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-800 mt-2">Page Not Found</h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            The page you are looking for has been layout-optimized out of existence, moved, or deleted. Let&apos;s get you back on track!
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center bg-optiblue-600 hover:bg-optiblue-700 text-white font-bold px-5 py-3 rounded-xl text-sm shadow-md transition-colors"
            >
              <Home className="h-4 w-4 mr-1.5" />
              <span>Go to Home</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex-1 inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-3 rounded-xl text-sm transition-colors border border-slate-200/50"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
