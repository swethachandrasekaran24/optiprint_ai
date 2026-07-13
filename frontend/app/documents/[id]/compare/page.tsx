"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../../../store/useAuthStore";
import { api } from "../../../../services/api";
import {
  ArrowLeft, FileText, Trees, DollarSign, Sparkles, Scale, Info,
  TrendingDown, CheckCircle, Download, FileSpreadsheet, Loader2, RefreshCw
} from "lucide-react";

export default function ComparePage() {
  const router = useRouter();
  const params = useParams();
  const docId = params?.id as string;
  const { isAuthenticated } = useAuthStore();

  const [doc, setDoc] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Stateful Cost Calculator
  const [costPerPage, setCostPerPage] = useState<number>(0.08); // default to $0.08
  const [paperSaved, setPaperSaved] = useState<number>(0);

  const fetchData = async () => {
    if (!docId) return;
    setLoading(true);
    setError("");
    try {
      // 1. Fetch document metadata
      const docRes = await api.get(`/documents`);
      const matchedDoc = docRes.data.find((d: any) => d.id === docId);
      if (!matchedDoc) {
        throw new Error("Document not found or access denied.");
      }
      setDoc(matchedDoc);

      // 2. Fetch report metadata
      const reportRes = await api.get(`/documents/${docId}/report`);
      setReport(reportRes.data);
      setPaperSaved(reportRes.data?.savings_metrics?.pages_saved || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load comparison data. Make sure optimization is completed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, docId, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin h-8 w-8 text-optiblue-500" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-optiblue-500 mx-auto" />
        <p className="text-slate-500 text-sm">Building comparison matrix...</p>
      </div>
    );
  }

  if (error || !doc || !report) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="inline-flex p-3 bg-rose-50 text-rose-500 rounded-full">
          <Info className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Comparison Data Unavailable</h2>
        <p className="text-slate-500 text-sm">{error || "Ensure you optimized this document before visiting this page."}</p>
        <div className="pt-2">
          <Link href="/upload" className="bg-optiblue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-optiblue-700 transition-all">
            Go to Upload & Optimize
          </Link>
        </div>
      </div>
    );
  }

  // Cost calculations
  const originalPages = report.original_pages || 1;
  const optimizedPages = report.optimized_pages || 1;
  const pagesSaved = report.savings_metrics?.pages_saved || 0;

  const originalCost = originalPages * costPerPage;
  const optimizedCost = optimizedPages * costPerPage;
  const moneySaved = pagesSaved * costPerPage;
  const percentageSaved = originalPages > 0 ? (pagesSaved / originalPages) * 100 : 0;

  // Ecological offset conversion metrics
  const treesSavedEquivalent = pagesSaved * 0.00012; // average sheet of paper is 0.00012 of a tree
  const carbonSavedEquivalent = pagesSaved * 11.2; // 11.2 grams CO2 per standard paper sheet

  const handleDownloadOptimized = () => {
    window.open(`http://localhost:8000/api/download/${docId}`, "_blank");
  };

  const handleDownloadPdfReport = () => {
    window.open(`http://localhost:8000/api/documents/${docId}/report/pdf`, "_blank");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link href="/documents" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Documents</span>
        </Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadPdfReport}
            className="inline-flex items-center bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4 mr-1 text-slate-500" />
            <span>PDF Summary Report</span>
          </button>
          <button
            onClick={handleDownloadOptimized}
            className="inline-flex items-center bg-optigreen-600 text-white font-semibold px-4 py-2 rounded-xl text-xs hover:bg-optigreen-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-1" />
            <span>Download Compact Document</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Optimization <span className="text-optigreen-600">Before & After</span> Analysis
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review dynamic print savings, calculate printing expenditures, and explore eco impacts.
        </p>
      </div>

      {/* Side-by-Side Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left Card: Original State */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3.5 bg-slate-100 text-slate-500 rounded-bl-2xl text-[10px] font-bold uppercase tracking-wider">
            Original Layout
          </div>
          <div className="space-y-6">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
              <FileText className="h-5.5 w-5.5 text-slate-400" />
              <span>Before Modification</span>
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                <span className="text-slate-500 font-medium">Document Name:</span>
                <span className="font-bold text-slate-700 truncate max-w-[200px]" title={doc.filename}>{doc.filename}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                <span className="text-slate-500 font-medium">Layout Page Count:</span>
                <span className="font-bold text-slate-700">{originalPages} Pages</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                <span className="text-slate-500 font-medium">Calculated Whitespace:</span>
                <span className="font-bold text-slate-700">{doc.analysis?.white_space_percentage || 30}%</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                <span className="text-slate-500 font-medium">Formatting Complexity:</span>
                <span className="font-bold text-slate-700 capitalize">{doc.analysis?.layout_complexity || "Low"}</span>
              </div>
            </div>

            {/* Visual Mini Mockup representing standard layout */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Layout Visualization</span>
              <div className="aspect-[4/5] bg-white border border-slate-200 rounded-lg p-5 mx-auto max-w-[180px] space-y-3 relative overflow-hidden shadow-sm">
                {/* Thick margins representation */}
                <div className="absolute inset-x-4 inset-y-5 border border-dashed border-rose-300 rounded opacity-60" />
                <div className="h-2.5 bg-slate-200 rounded w-4/5" />
                <div className="h-2 bg-slate-100 rounded w-full" />
                <div className="h-2 bg-slate-100 rounded w-full" />
                <div className="h-2 bg-slate-100 rounded w-11/12" />
                <div className="h-4" /> {/* blank spacers */}
                <div className="h-2.5 bg-slate-200 rounded w-3/5" />
                <div className="h-2 bg-slate-100 rounded w-full" />
                <div className="h-2 bg-slate-100 rounded w-10/12" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Optimized State */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-optigreen-100 shadow-xl shadow-optigreen-50/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3.5 bg-optigreen-50 text-optigreen-700 rounded-bl-2xl text-[10px] font-bold uppercase tracking-wider">
            Optimized Layout
          </div>
          <div className="space-y-6">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
              <Sparkles className="h-5.5 w-5.5 text-optigreen-500" />
              <span>After Modification</span>
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                <span className="text-slate-500 font-medium">Layout Page Count:</span>
                <span className="font-black text-optigreen-600">{optimizedPages} Pages</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                <span className="text-slate-500 font-medium">Pages Saved Offset:</span>
                <span className="font-extrabold text-optigreen-600 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1 text-optigreen-500 animate-pulse" />
                  <span>{pagesSaved} Pages ({percentageSaved.toFixed(0)}% reduction)</span>
                </span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                <span className="text-slate-500 font-medium">Optimization Squeeze Mode:</span>
                <span className="font-bold text-slate-700">{report.mode || "Smart"}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                <span className="text-slate-500 font-medium">Formatting Target:</span>
                <span className="font-bold text-slate-700">{report.purpose || "Office Document"}</span>
              </div>
            </div>

            {/* Visual Mini Mockup representing compacted layout */}
            <div className="bg-optigreen-50/20 p-6 rounded-2xl border border-optigreen-50 space-y-4">
              <span className="text-[10px] font-extrabold text-optigreen-700 uppercase tracking-wider block">Layout Visualization</span>
              <div className="aspect-[4/5] bg-white border border-optigreen-200 rounded-lg p-3.5 mx-auto max-w-[180px] space-y-2 relative overflow-hidden shadow-sm">
                {/* Compact margins representation */}
                <div className="absolute inset-x-2 inset-y-2.5 border border-dashed border-optigreen-300 rounded opacity-60" />
                <div className="h-2.5 bg-slate-200 rounded w-5/6" />
                <div className="h-2 bg-slate-100 rounded w-full" />
                <div className="h-2 bg-slate-100 rounded w-full" />
                <div className="h-2 bg-slate-100 rounded w-full" />
                <div className="h-2 bg-slate-100 rounded w-full" />
                <div className="h-2 bg-slate-100 rounded w-11/12" />
                <div className="h-2 bg-slate-100 rounded w-full" />
                <div className="h-2 bg-slate-100 rounded w-10/12" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Printing Cost Calculator Widget */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
              <Scale className="h-5.5 w-5.5 text-optiblue-500" />
              <span>Stateful Printing Cost Calculator</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">Input your local printing costs below to compute custom finance offsets.</p>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">$</span>
            <input
              type="number"
              step="0.01"
              value={costPerPage}
              onChange={(e) => setCostPerPage(Math.max(0.01, parseFloat(e.target.value) || 0))}
              className="appearance-none pl-7 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-optiblue-500 text-slate-800 font-extrabold text-sm w-40"
              title="Enter price per single print page"
            />
            <span className="text-[10px] text-slate-400 block mt-1 text-right">Cost Per Printed Page</span>
          </div>
        </div>

        {/* Output Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Before Print Cost</span>
            <span className="text-2xl font-extrabold text-slate-700 block mt-1.5">${originalCost.toFixed(2)}</span>
          </div>
          <div className="p-5 bg-optigreen-50/30 border border-optigreen-100/50 rounded-2xl">
            <span className="text-[10px] font-bold text-optigreen-800 uppercase tracking-wider block">Optimized Cost</span>
            <span className="text-2xl font-black text-optigreen-700 block mt-1.5">${optimizedCost.toFixed(2)}</span>
          </div>
          <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Net Financial Saved</span>
            <span className="text-2xl font-black text-amber-600 block mt-1.5">${moneySaved.toFixed(2)}</span>
          </div>
          <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Budget Reduction</span>
            <span className="text-2xl font-black text-blue-600 block mt-1.5">{percentageSaved.toFixed(0)}% Saved</span>
          </div>
        </div>
      </div>

      {/* Ecological Offset and Environmental Impacts Summary */}
      <div className="bg-slate-50/50 p-6 sm:p-8 rounded-3xl border border-slate-100 space-y-6">
        <div>
          <h4 className="font-extrabold text-slate-800 text-sm flex items-center space-x-1.5">
            <Trees className="h-5 w-5 text-optigreen-600" />
            <span>Ecological & Environmental Conservation Footprint</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Calculated carbon capture offsets equivalent to saving {pagesSaved} physical papers.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Trees className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trees Conserved</span>
              <span className="text-base font-extrabold text-slate-800 mt-0.5">{treesSavedEquivalent.toFixed(5)} Trees</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center space-x-3.5">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingDown className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Carbon Avoided</span>
              <span className="text-base font-extrabold text-slate-800 mt-0.5">{carbonSavedEquivalent.toFixed(1)} g CO2</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center space-x-3.5">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <FileSpreadsheet className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Paper Saved</span>
              <span className="text-base font-extrabold text-slate-800 mt-0.5">{pagesSaved} Sheets</span>
            </div>
          </div>
        </div>

        {/* AI report adjustments explanation block */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-start space-x-2.5 text-xs text-slate-500">
          <CheckCircle className="h-5 w-5 text-optigreen-600 flex-shrink-0" />
          <p className="leading-relaxed">
            <b>Structural Audit Log:</b> {report.content_changes_summary}
          </p>
        </div>
      </div>

    </div>
  );
}
