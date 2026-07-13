"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { api } from "../../services/api";
import {
  FileText, Trash2, Eye, Calendar, Sparkles, Download,
  X, CheckCircle, AlertCircle, Loader2, DollarSign, Trees, Info
} from "lucide-react";

export default function DocumentsPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Report Modal State
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const fetchDocuments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/documents");
      setDocuments(res.data);
    } catch (err: any) {
      setError("Failed to retrieve documents. Please verify the backend is active.");
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
    fetchDocuments();
  }, [isAuthenticated, router]);

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document and its associated reports?")) {
      return;
    }
    try {
      await api.delete(`/documents/${docId}`);
      // Filter out deleted document from state list
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
        setReport(null);
      }
    } catch (err: any) {
      alert("Failed to delete document. Please try again.");
    }
  };

  const handleViewReport = async (doc: any) => {
    setSelectedDoc(doc);
    setReport(null);
    setReportLoading(true);
    setReportError("");

    try {
      const res = await api.get(`/documents/${doc.id}/report`);
      setReport(res.data);
    } catch (err: any) {
      setReportError("The optimization report is currently being calculated or is unavailable.");
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleDownloadOptimized = (docId: string) => {
    window.open(`http://localhost:8000/api/download/${docId}`, "_blank");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-6 bg-white rounded-3xl shadow border border-slate-100 max-w-sm">
          <Loader2 className="animate-spin h-8 w-8 text-optiblue-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Redirecting...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Documents</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your uploaded files, review AI optimization reports, and download compacted print-ready files.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-4">
            <Loader2 className="animate-spin h-10 w-10 text-optiblue-500 mx-auto" />
            <p className="text-slate-500 text-sm font-medium">Fetching documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <FileText className="h-14 w-14 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No documents found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Upload PDF, DOCX, or PPTX files to analyze and optimize their layout formatting before printing.
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push("/upload")}
                className="bg-optiblue-600 hover:bg-optiblue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                Upload First File
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Document Details</th>
                  <th className="px-6 py-4">File Type</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 min-w-[200px] truncate max-w-xs" title={doc.filename}>
                      {doc.filename}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-500">
                      {doc.file_type.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {(doc.file_size / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-optigreen-50 text-optigreen-700 uppercase">
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(doc.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => router.push(`/documents/${doc.id}/compare`)}
                        className="inline-flex items-center p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
                        title="View before-vs-after comparison"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleViewReport(doc)}
                        className="inline-flex items-center p-2 text-optiblue-600 bg-optiblue-50 hover:bg-optiblue-100 rounded-xl transition-colors"
                        title="View optimization report"
                      >
                        <Info className="h-4.5 w-4.5" />
                      </button>
                      {doc.status === "optimized" && (
                        <button
                          onClick={() => handleDownloadOptimized(doc.id)}
                          className="inline-flex items-center p-2 text-optigreen-600 bg-optigreen-50 hover:bg-optigreen-100 rounded-xl transition-colors"
                          title="Download Optimized PDF"
                        >
                          <Download className="h-4.5 w-4.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="inline-flex items-center p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REPORT DRAWER / DIALOG MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800 truncate max-w-md" title={selectedDoc.filename}>
                  {selectedDoc.filename}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Optimization Report & Savings Analysis</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              {reportLoading && (
                <div className="py-16 text-center space-y-4">
                  <Loader2 className="animate-spin h-10 w-10 text-optiblue-500 mx-auto" />
                  <p className="text-slate-500 text-sm">Calculating savings and fetching report details...</p>
                </div>
              )}

              {reportError && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-sm text-rose-700 flex items-start space-x-2.5">
                  <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{reportError}</span>
                </div>
              )}

              {!reportLoading && report && (
                <div className="space-y-6">
                  {/* Savings metric cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-optigreen-50 p-4 rounded-2xl border border-optigreen-100 text-center">
                      <span className="text-[10px] font-bold text-optigreen-700 uppercase tracking-wider block">Pages Saved</span>
                      <span className="text-2xl font-black text-slate-800 block mt-1">
                        {report.savings_metrics?.pages_saved}
                      </span>
                      <span className="text-[9px] text-slate-400">Total papers saved</span>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Money Saved</span>
                      <span className="text-2xl font-black text-slate-800 block mt-1">
                        ${report.savings_metrics?.money_saved.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-400">Toner & paper fees</span>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Carbon Avoided</span>
                      <span className="text-2xl font-black text-slate-800 block mt-1">
                        {report.savings_metrics?.carbon_saved} g
                      </span>
                      <span className="text-[9px] text-slate-400">CO2 footprint reduction</span>
                    </div>
                  </div>

                  {/* Comparisons details */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-3.5">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-optiblue-500" />
                      <span>Page Budget Comparison</span>
                    </h4>
                    <div className="flex items-center justify-between text-sm py-2">
                      <div className="text-slate-500">Original Document:</div>
                      <div className="font-bold text-slate-800">{report.original_pages} Pages</div>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex items-center justify-between text-sm py-2">
                      <div className="text-slate-500">Optimized Document:</div>
                      <div className="font-bold text-optigreen-600">{report.optimized_pages} Pages</div>
                    </div>
                  </div>

                  {/* Optimization summary text */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                      <Info className="h-4.5 w-4.5 text-optigreen-500" />
                      <span>AI Structural Adjustments</span>
                    </h4>
                    <p className="text-slate-500 text-xs leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {report.content_changes_summary}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedDoc(null)}
                className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Close Report
              </button>
              {!reportLoading && report && (
                <button
                  onClick={() => handleDownloadOptimized(selectedDoc.id)}
                  className="bg-optigreen-600 hover:bg-optigreen-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  <span>Download Optimized File</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
