"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { api } from "../../services/api";
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle,
  Loader2, ArrowRight, DollarSign, Trees, Sparkles,
  Sliders, Info, FileCheck, HelpCircle, LayoutGrid, Scale, Type, Compass
} from "lucide-react";

const PURPOSES = [
  "College Assignment",
  "Project Report",
  "Office Document",
  "Government Record",
  "Legal Document",
  "Research Paper",
  "Personal Notes",
  "Book",
  "Other"
];

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("");

  const [error, setError] = useState("");
  const [docId, setDocId] = useState("");

  // Step-based layout: "select" -> "analyzing" -> "analysis_done" -> "optimizing" -> "done"
  const [step, setStep] = useState<"select" | "analyzing" | "analysis_done" | "optimizing" | "done">("select");
  const [analysis, setAnalysis] = useState<any>(null);

  // Settings selected before optimization
  const [purpose, setPurpose] = useState("College Assignment");
  const [mode, setMode] = useState("Smart"); // Safe, Smart, Maximum Savings
  const [instructions, setInstructions] = useState("");
  const [optimizedReport, setOptimizedReport] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError("");
    setStep("select");
    setAnalysis(null);
    setOptimizedReport(null);
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();

    if (!ext || !["pdf", "docx", "pptx"].includes(ext)) {
      setError("Invalid file type. Only PDF, DOCX, and PPTX files are supported.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File exceeds 50MB size limit.");
      return;
    }

    setFile(selectedFile);
  };

  // Phase 1: Upload and run AI Analysis
  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setStep("analyzing");
    setError("");
    setProgress(15);
    setPhase("Uploading document securely...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload file first
      const uploadRes = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedDocId = uploadRes.data.id;
      setDocId(uploadedDocId);
      setProgress(50);
      setPhase("AI Scanning page content layouts...");

      // Call analysis endpoint
      const analyzeRes = await api.post("/analyze", { document_id: uploadedDocId });

      setProgress(100);
      setAnalysis(analyzeRes.data);
      setStep("analysis_done");
    } catch (err: any) {
      setStep("select");
      setError(err.response?.data?.detail || "Layout analysis failed. Check backend connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Phase 2: Execute optimization pipeline
  const handleOptimize = async () => {
    if (!docId) return;
    setLoading(true);
    setStep("optimizing");
    setError("");
    setProgress(10);
    setPhase("Formulating spatial compression parameters...");

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 40) {
          return prev + 15;
        } else if (prev < 85) {
          setPhase("Executing layout reflow & whitespace squeezing...");
          return prev + 8;
        } else {
          clearInterval(interval);
          return 90;
        }
      });
    }, 400);

    try {
      const res = await api.post("/optimize", {
        document_id: docId,
        purpose,
        mode,
        instructions
      });

      clearInterval(interval);
      setProgress(100);
      setPhase("Compacting and rendering PDF...");

      setTimeout(() => {
        setOptimizedReport(res.data);
        setStep("done");
        setFile(null);
        setLoading(false);
      }, 800);

    } catch (err: any) {
      clearInterval(interval);
      setStep("analysis_done");
      setLoading(false);
      setError(err.response?.data?.detail || "Optimization failed. Check if server is running.");
      console.error(err);
    }
  };

  const handleDownload = () => {
    if (!docId) return;
    window.open(`http://localhost:8000/api/download/${docId}`, "_blank");
  };

  const resetForm = () => {
    setFile(null);
    setDocId("");
    setStep("select");
    setAnalysis(null);
    setOptimizedReport(null);
    setError("");
    setProgress(0);
    setInstructions("");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          AI Document <span className="text-optigreen-600">Layout Optimizer</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 max-w-lg mx-auto">
          Intelligently restructure formatting spaces, line gaps, and margins using purpose-based boundary limits.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-sm text-rose-700 flex items-start space-x-2.5">
          <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP-BY-STEP CONTAINER */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 relative overflow-hidden">

        {/* PROGRESS LOADING OVERLAY */}
        {loading && (
          <div className="py-12 space-y-6 text-center max-w-md mx-auto">
            <Loader2 className="animate-spin h-10 w-10 text-optiblue-500 mx-auto" />
            <div className="space-y-1">
              <p className="font-bold text-slate-800">{phase}</p>
              <p className="text-xs text-slate-400">Our engine is compiling layout metrics...</p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-optiblue-500 to-optigreen-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-bold text-slate-500">{progress}% Completed</p>
          </div>
        )}

        {/* STEP 1: SELECT FILE */}
        {!loading && step === "select" && (
          <div className="space-y-8">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                dragActive
                  ? "border-optiblue-500 bg-optiblue-50/50"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.pptx"
                onChange={handleFileInput}
              />
              <UploadCloud className={`h-16 w-16 mb-4 transition-transform ${dragActive ? "scale-110 text-optiblue-500" : "text-slate-400"}`} />

              {file ? (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-800 truncate max-w-sm">
                    Selected: {file.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-700">
                    Drag and drop your file here, or <span className="text-optiblue-600 hover:text-optiblue-700 underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports PDF, DOCX, or PPTX format up to 50MB.
                  </p>
                </div>
              )}
            </div>

            {/* Supported file badges */}
            <div className="grid grid-cols-3 gap-4 text-center max-w-sm mx-auto">
              <div className="border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                <span className="text-xs font-bold text-rose-600 block">PDF</span>
                <span className="text-[10px] text-slate-400">Adobe PDF</span>
              </div>
              <div className="border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                <span className="text-xs font-bold text-blue-600 block">DOCX</span>
                <span className="text-[10px] text-slate-400">Word Document</span>
              </div>
              <div className="border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                <span className="text-xs font-bold text-amber-600 block">PPTX</span>
                <span className="text-[10px] text-slate-400">PowerPoint</span>
              </div>
            </div>

            {file && (
              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleAnalyze}
                  className="inline-flex items-center justify-center bg-optiblue-600 hover:bg-optiblue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-optiblue-100 transition-colors text-base"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  <span>Analyze Document Layout</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SHOW ANALYSIS & CONFIGURE RUN OPTIONS */}
        {!loading && step === "analysis_done" && analysis && (
          <div className="space-y-8">
            <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
              <CheckCircle2 className="h-6 w-6 text-optigreen-600" />
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">AI Layout Analysis Succeeded!</h3>
                <p className="text-xs text-slate-400">Review layout characteristics and configure optimization metrics.</p>
              </div>
            </div>

            {/* File characteristics results grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Page Count</span>
                <span className="text-xl font-extrabold text-slate-800 block mt-1">{analysis.page_count} Pages</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Complexity</span>
                <span className="text-xl font-extrabold text-slate-800 block mt-1 capitalize">{analysis.layout_complexity}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Whitespace</span>
                <span className="text-xl font-extrabold text-slate-800 block mt-1">{analysis.white_space_percentage}%</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Font Size</span>
                <span className="text-xl font-extrabold text-slate-800 block mt-1">{analysis.font_sizes?.average} pt</span>
              </div>
            </div>

            {/* Detailed stats accordion card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                <LayoutGrid className="h-4 w-4 mr-1 text-slate-400" />
                <span>Detected Layout Characteristics</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs text-slate-600">
                <li className="flex justify-between py-1 border-b border-slate-100">
                  <span>Formatting Margins:</span>
                  <span className="font-bold">T: {analysis.margins?.top}&quot;, B: {analysis.margins?.bottom}&quot;, L: {analysis.margins?.left}&quot;, R: {analysis.margins?.right}&quot;</span>
                </li>
                <li className="flex justify-between py-1 border-b border-slate-100">
                  <span>Line Spacing:</span>
                  <span className="font-bold">{analysis.line_spacing}</span>
                </li>
                <li className="flex justify-between py-1 border-b border-slate-100">
                  <span>Blank Pages Detected:</span>
                  <span className="font-bold">{analysis.blank_pages?.length > 0 ? analysis.blank_pages.join(", ") : "None"}</span>
                </li>
                <li className="flex justify-between py-1 border-b border-slate-100">
                  <span>Nearly Blank Pages:</span>
                  <span className="font-bold">{analysis.nearly_blank_pages?.length > 0 ? analysis.nearly_blank_pages.join(", ") : "None"}</span>
                </li>
                <li className="flex justify-between py-1 border-b border-slate-100">
                  <span>Images / Graphic Boxes:</span>
                  <span className="font-bold">{analysis.images?.length || 0} found</span>
                </li>
                <li className="flex justify-between py-1 border-b border-slate-100">
                  <span>Table Objects:</span>
                  <span className="font-bold">{analysis.tables?.length || 0} tables</span>
                </li>
              </ul>
            </div>

            {/* RULE CONFIGURATOR MATRIX FORM */}
            <div className="border-t border-slate-100 pt-6 space-y-6">
              <h4 className="font-extrabold text-slate-800 text-base flex items-center space-x-1.5">
                <Sliders className="h-5 w-5 text-optiblue-500" />
                <span>AI Compaction Parameters</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 1. PURPOSE */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                    <Compass className="h-4 w-4 mr-1 text-slate-400" />
                    <span>Document Purpose</span>
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-optiblue-500 focus:border-transparent transition-all text-sm bg-slate-50/50 hover:bg-slate-50"
                  >
                    {PURPOSES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Automatically limits spacing based on compliance guidelines.</p>
                </div>

                {/* 2. OPTIMIZATION MODE */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                    <Scale className="h-4 w-4 mr-1 text-slate-400" />
                    <span>Optimization Mode</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Safe", "Smart", "Maximum Savings"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          mode === m
                            ? "bg-optiblue-600 text-white border-optiblue-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Smart is balanced, Maximum squeezes to absolute limit.</p>
                </div>
              </div>

              {/* 3. ADDITIONAL INSTRUCTIONS BOX */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <Type className="h-4 w-4 mr-1 text-slate-400" />
                  <span>Additional Instructions (multiline)</span>
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-optiblue-500 focus:border-transparent transition-all text-sm bg-slate-50/50 hover:bg-slate-50 resize-none"
                  placeholder="e.g., Do not reduce font size, Preserve tables, Do not move figures, Reduce only margins..."
                />
              </div>
            </div>

            {/* Submits */}
            <div className="pt-4 flex flex-col sm:flex-row justify-end items-center gap-3">
              <button
                onClick={resetForm}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-colors"
              >
                Clear File
              </button>
              <button
                onClick={handleOptimize}
                className="w-full sm:w-auto inline-flex items-center justify-center bg-optigreen-600 hover:bg-optigreen-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-optigreen-100 transition-colors text-sm"
              >
                <Sparkles className="h-4.5 w-4.5 mr-1.5" />
                <span>Run Layout Optimization</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DONE - SAVINGS REPORT & DOWNLOAD ACTIONS */}
        {!loading && step === "done" && optimizedReport && (
          <div className="space-y-8 text-center py-4">
            <div className="inline-flex p-3.5 bg-emerald-50 text-emerald-600 rounded-full mb-2">
              <CheckCircle2 className="h-12 w-12 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Optimization Completed!</h2>
              <p className="text-slate-500 text-sm mt-1">
                We successfully applied <span className="font-bold text-slate-700">{optimizedReport.mode}</span> compaction metrics.
              </p>
            </div>

            {/* Savings stats grids */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto text-left">
              <div className="bg-optigreen-50/60 p-5 rounded-2xl border border-optigreen-100">
                <span className="text-[10px] font-bold text-optigreen-700 uppercase tracking-wider block">Pages Saved</span>
                <span className="text-3xl font-black text-slate-800 block mt-2">{optimizedReport.savings_metrics?.pages_saved} Pages</span>
                <p className="text-[10px] text-slate-400 mt-1">Pruned out empty whitespaces.</p>
              </div>
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Money Saved</span>
                <span className="text-3xl font-black text-slate-800 block mt-2">${optimizedReport.savings_metrics?.money_saved.toFixed(2)}</span>
                <p className="text-[10px] text-slate-400 mt-1">Toner paper costs reduced.</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Carbon Impact</span>
                <span className="text-3xl font-black text-slate-800 block mt-2">{optimizedReport.savings_metrics?.carbon_saved} g</span>
                <p className="text-[10px] text-slate-400 mt-1">CO2 equivalent prevented.</p>
              </div>
            </div>

            {/* Squeeze Summary explanation */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Info className="h-4 w-4 mr-1 text-slate-400" />
                <span>AI Restructuring summary</span>
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                {optimizedReport.content_changes_summary}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto inline-flex items-center justify-center bg-optiblue-600 hover:bg-optiblue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-optiblue-100 transition-colors text-sm"
              >
                <FileText className="h-4 w-4 mr-1.5" />
                <span>Download Optimized PDF</span>
              </button>
              <button
                onClick={resetForm}
                className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 py-3.5 rounded-xl transition-colors text-sm"
              >
                Optimize New File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
