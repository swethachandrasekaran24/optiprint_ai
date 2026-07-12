import Link from "next/link";
import { Printer, Zap, DollarSign, Trees, ArrowRight, ShieldCheck, FileCheck, Layers } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-optiblue-50 border border-optiblue-100 rounded-full px-3 py-1.5 text-xs font-semibold text-optiblue-700 mb-6 tracking-wide uppercase">
            <Zap className="h-3.5 w-3.5" />
            <span>AI-Powered Layout Compression</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Stop Wasting Money on <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-optiblue-600 to-optigreen-600 bg-clip-text text-transparent">
              Excessive Printing Spacing
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-500 leading-relaxed">
            OptiPrint AI intelligently optimizes document layouts, margins, whitespace, and image positions before you hit print—slashing up to 40% off your paper and toner costs while preserving absolute readability.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-optiblue-600 hover:bg-optiblue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-optiblue-200 transition-all text-base group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-8 py-4 rounded-xl transition-colors text-base"
            >
              Sign In to Your Dashboard
            </Link>
          </div>
          {/* Hero visual representation of document savings */}
          <div className="mt-16 bg-white border border-slate-100 shadow-xl rounded-2xl max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-left">
              <h3 className="text-xl font-bold text-slate-800">Original Document</h3>
              <p className="text-xs text-slate-400 mt-1">Typical loose, unoptimized 5-page layout</p>
              <div className="mt-4 space-y-2 bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200">
                <div className="h-4 bg-slate-300 w-3/4 rounded" />
                <div className="h-4 bg-slate-200 w-1/2 rounded" />
                <div className="h-20 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">
                  Massive Empty Margin Space
                </div>
                <div className="h-4 bg-slate-300 w-5/6 rounded" />
              </div>
            </div>
            <div className="p-4 bg-optiblue-50 rounded-full text-optiblue-600 font-bold text-lg pulse-slow">
              ➔ Optimizing... ➔
            </div>
            <div className="flex-1 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-optigreen-600">OptiPrint AI Document</h3>
                <span className="text-xs font-semibold bg-optigreen-100 text-optigreen-700 px-2 py-0.5 rounded">
                  Saved 2 Pages!
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Smart, compact, clean 3-page layout</p>
              <div className="mt-4 space-y-2 bg-optigreen-50/50 p-4 rounded-lg border border-optigreen-100">
                <div className="h-4 bg-optigreen-200 w-5/6 rounded" />
                <div className="h-4 bg-optigreen-100 w-2/3 rounded" />
                <div className="h-10 bg-optigreen-100 rounded flex items-center justify-center text-optigreen-700 text-xs font-semibold">
                  Intelligent Spacing Compacted
                </div>
                <div className="h-4 bg-optigreen-200 w-4/5 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Platform Features Built For Savings
            </h2>
            <p className="mt-4 text-slate-500 text-lg">
              Maximize efficiency and savings automatically. We make documents print-ready by restructuring spatial waste.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-slate-100 shadow-sm p-8 rounded-2xl bg-white hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-optiblue-100 text-optiblue-600 flex items-center justify-center mb-6">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Margins & Border Control</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Smart adjustment of margin buffers without cutting text. Shrink unused boundaries and maximize page content area dynamically.
              </p>
            </div>
            <div className="border border-slate-100 shadow-sm p-8 rounded-2xl bg-white hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-optigreen-100 text-optigreen-600 flex items-center justify-center mb-6">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Whitespace Squeezing</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Condenses redundant spaces, line breaks, and page gaps. Merges overflowing tail paragraphs back to make the entire layout cohesive.
              </p>
            </div>
            <div className="border border-slate-100 shadow-sm p-8 rounded-2xl bg-white hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Preserved Readability</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Keeps your original document structure, fonts, and headers. Our optimizer guarantees high compliance with human reading guidelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              How It Works
            </h2>
            <p className="mt-4 text-slate-500 text-lg">
              Start optimizing in three simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-optiblue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-optiblue-100 mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Files</h3>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                Drag-and-drop your PDF, DOCX, or PPTX file onto our secure upload platform. We validate the file type and size.
              </p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-optigreen-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-optigreen-100 mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">AI Analyzes & Compresses</h3>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                The algorithm squeezes unused whitespaces, scales overflowing tables, and compresses layout flow without losing resolution.
              </p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-slate-300 mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Download Print-Ready PDF</h3>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                Instantly download the compacted file. Hit print on your normal printer and watch paper and ink costs plummet!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 items-center gap-16">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Eco-Friendly & Wallet-Saving Printing Platform
              </h2>
              <p className="mt-6 text-slate-500 text-base leading-relaxed">
                Paper manufacturing, heavy toner inks, and energy consumption during volume printing heavily strain budgets and natural resources. OptiPrint AI serves students, libraries, schools, legal teams, and global business offices to make every print highly optimized.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 mt-1">
                    <Trees className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Carbon Footprint Slashing</h4>
                    <p className="text-sm text-slate-500">Every optimized page directly reduces forest logging, water treatment, and shipping transport emissions.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-1">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Direct Financial Savings</h4>
                    <p className="text-sm text-slate-500">Saves money instantly on bulk paper stacks, high-yield toner replacements, and heavy-duty copier rentals.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-tr from-optiblue-50 to-optigreen-50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-center items-center shadow-inner relative overflow-hidden h-96">
              <Printer className="h-32 w-32 text-optiblue-500 mb-6 animate-bounce" />
              <div className="text-center">
                <span className="text-4xl font-black text-slate-800 block">30% - 40%</span>
                <span className="text-slate-500 text-sm font-semibold tracking-wider uppercase mt-1 block">Average Paper Reduction Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-16 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to print smarter and save trees?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-10 text-base">
            Create your free account today and start optimizing document margins, whitespaces, and image placement instantly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/register"
              className="bg-optigreen-600 hover:bg-optigreen-700 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-lg shadow-optigreen-900 transition-colors"
            >
              Sign Up For Free
            </Link>
            <Link
              href="/login"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors border border-slate-700"
            >
              Access Member Login
            </Link>
          </div>
        </div>
        <div className="absolute top-1/2 left-0 right-0 h-96 bg-optiblue-500/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />
      </section>
    </div>
  );
}
