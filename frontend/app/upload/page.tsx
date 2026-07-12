"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { api } from "../../services/api";
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle,
  Loader2, ArrowRight, DollarSign, Trees, Sparkles, FileText as DocIcon
} from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(""); // "uploading", "optimizing", "done"

  const [successData, setSuccessData] = useState<any>(null);
  const [error, setError] = useState("");

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
    setSuccessData(null);
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();

    if (!ext || !["pdf", "docx", "pptx"].includes(ext)) {
      setError("Invalid file type. Only PDF, DOCX, and PPTX files are supported.");
      return;
    }

    // 50MB Size limit
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File exceeds 50MB size limit.");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setProgress(0);
    setPhase("Uploading file...");

    // Fake progressive bar to look premium
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 40) {
          return prev + 10;
        } else if (prev < 85) {
          setPhase("Intelligent AI Compressing whitespace & layouts...");
          return prev + 5;
        } else {
          clearInterval(interval);
          return 90;
        }
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Clear interval and complete progress
      clearInterval(interval);
      setProgress(100);
      setPhase("Optimization successfully completed!");

      // Delay success slightly for high-quality feel
      setTimeout(() => {
        setSuccessData(res.data);
        setFile(null);
        setLoading(false);
      }, 800);

    } catch (err: any) {
      clearInterval(interval);
      setLoading(false);
      setError(err.response?.data?.detail || "Upload failed. Please make sure the backend is active.");
      console.error(err);
    }
  };

  const resetForm = () => {
    setFile(null);
    setSuccessData(null);
    setError("");
    setProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Optimize Your <span className="text-optiblue-600">Document Layout</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 max-w-lg mx-auto">
          Reduce page counts and margins instantly. Drag-and-drop to let our spatial AI compress spacing.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 relative overflow-hidden">
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-100 rounded-xl p-4 text-sm text-rose-700 flex items-start space-x-2.5">
            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. SUCCESS VIEW */}
        {successData && (
          <div className="space-y-8 text-center py-4">
            <div className="inline-flex p-3.5 bg-emerald-50 text-emerald-600 rounded-full mb-2">
              <CheckCircle2 className="h-10 w-10 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Optimization Successful!</h2>
              <p className="text-slate-500 text-sm mt-1">
                We have intelligently optimized margins and whitespaces for <span className="font-bold text-slate-700">{successData.filename}</span>.
              </p>
            </div>

            {/* Micro Stats summary card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-optigreen-50/50 p-5 rounded-2xl border border-optigreen-100 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-optigreen-700 uppercase">Pages Count</span>
                  <DocIcon className="h-4 w-4 text-optigreen-600" />
                </div>
                <div className="text-xl font-extrabold text-slate-800 mt-2">
                  {successData.pages_count} Pages Original
                </div>
                <p className="text-xs text-slate-500 mt-1">Page layout restructured.</p>
              </div>

              <div className="bg-optiblue-50/50 p-5 rounded-2xl border border-optiblue-100 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-optiblue-700 uppercase">Toner Spacing</span>
                  <Sparkles className="h-4 w-4 text-optiblue-600" />
                </div>
                <div className="text-xl font-extrabold text-slate-800 mt-2">
                  Optimized Clean Flow
                </div>
                <p className="text-xs text-slate-500 mt-1">Compacted with 0% text size reduction.</p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                href="/documents"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-optiblue-600 hover:bg-optiblue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors"
              >
                <span>View Reports & Download</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <button
                onClick={resetForm}
                className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Optimize Another File
              </button>
            </div>
          </div>
        )}

        {/* 2. LOADING PROGRESS VIEW */}
        {loading && (
          <div className="py-12 space-y-6 text-center max-w-md mx-auto">
            <Loader2 className="animate-spin h-10 w-10 text-optiblue-500 mx-auto" />
            <div className="space-y-2">
              <p className="font-bold text-slate-800">{phase}</p>
              <p className="text-xs text-slate-400">Please do not refresh this page.</p>
            </div>

            {/* Progress bar boundary */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-optiblue-500 to-optigreen-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-bold text-slate-500">{progress}% Completed</p>
          </div>
        )}

        {/* 3. FILE SELECTION / DRAG TARGET */}
        {!loading && !successData && (
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

            {/* Submit button */}
            {file && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleUpload}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-optiblue-600 hover:bg-optiblue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-optiblue-100 transition-colors text-base"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  <span>Start AI Layout Optimization</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
