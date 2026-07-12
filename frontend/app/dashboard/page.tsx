"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { api } from "../../services/api";
import {
  FileText, Trees, DollarSign, RefreshCw, UploadCloud,
  ArrowRight, ShieldCheck, Activity, Calendar, FileCheck, ArrowUpRight, Loader2
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, token, user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/dashboard");
      setData(res.data);
    } catch (err: any) {
      setError("Failed to fetch dashboard data. Please make sure the backend is running.");
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
    fetchDashboard();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-6 bg-white rounded-3xl shadow border border-slate-100 max-w-sm">
          <Loader2 className="animate-spin h-8 w-8 text-optiblue-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Redirecting to Login...</h3>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {/* Mock bones */}
          <div className="h-10 bg-slate-200 w-1/4 rounded-md animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="h-32 bg-slate-200 rounded-3xl animate-pulse" />
            <div className="h-32 bg-slate-200 rounded-3xl animate-pulse" />
            <div className="h-32 bg-slate-200 rounded-3xl animate-pulse" />
            <div className="h-32 bg-slate-200 rounded-3xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="h-96 bg-slate-200 lg:col-span-2 rounded-3xl animate-pulse" />
            <div className="h-96 bg-slate-200 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    total_documents: 0,
    total_optimized: 0,
    pages_saved: 0,
    money_saved: 0.0,
    carbon_saved: 0.0
  };

  const recentUploads = data?.recent_uploads || [];
  const recentActivity = data?.recent_activity || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Welcome back, <span className="text-optiblue-600">{user?.full_name}</span>!
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Let&apos;s check your real-time printing cost savings and eco impact.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={fetchDashboard}
            className="flex-1 md:flex-none inline-flex items-center justify-center p-2.5 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <Link
            href="/upload"
            className="flex-1 md:flex-none inline-flex items-center justify-center bg-optigreen-600 hover:bg-optigreen-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-optigreen-100 transition-colors"
          >
            <UploadCloud className="h-4.5 w-4.5 mr-2" />
            <span>Optimize New File</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Documents */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Documents</span>
            <span className="text-2xl font-extrabold text-slate-800">{stats.total_documents}</span>
          </div>
        </div>

        {/* Pages Saved */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Pages Saved</span>
            <span className="text-2xl font-extrabold text-optigreen-600">{stats.pages_saved}</span>
          </div>
        </div>

        {/* Money Saved */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Money Saved</span>
            <span className="text-2xl font-extrabold text-amber-600">${stats.money_saved.toFixed(2)}</span>
          </div>
        </div>

        {/* Carbon Footprint Impact */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-green-50 rounded-2xl text-green-600">
            <Trees className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Carbon Saved</span>
            <span className="text-2xl font-extrabold text-emerald-700">{stats.carbon_saved} g</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left lists recent uploads, right shows activity history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Uploads */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-optiblue-500" />
              <span>Recent Uploads</span>
            </h3>
            <Link
              href="/documents"
              className="text-xs font-semibold text-optiblue-600 hover:text-optiblue-700 flex items-center space-x-1"
            >
              <span>Manage all docs</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentUploads.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
              <UploadCloud className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No files uploaded yet.</p>
              <Link
                href="/upload"
                className="mt-3 inline-flex items-center text-xs font-bold text-optigreen-600 hover:underline"
              >
                <span>Upload your first document</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentUploads.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 p-4 rounded-2xl transition-colors border border-slate-50"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="p-2.5 bg-white border border-slate-100 text-slate-600 rounded-xl flex-shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate max-w-xs sm:max-w-md" title={doc.filename}>
                        {doc.filename}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {doc.file_type.toUpperCase()} &bull; {(doc.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold bg-optigreen-100 text-optigreen-700 px-2.5 py-1 rounded-full uppercase">
                      {doc.status}
                    </span>
                    <Link
                      href="/documents"
                      className="p-1.5 bg-white text-slate-400 hover:text-optiblue-600 rounded-lg border border-slate-100 shadow-sm"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Logs */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-optigreen-500" />
            <span>Activity History</span>
          </h3>

          {recentActivity.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">No recent logs recorded.</p>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((log: any, logIdx: number) => {
                  let logTitle = log.action;
                  let color = "bg-blue-500";

                  if (log.action === "user_register") {
                    logTitle = "Account Created";
                    color = "bg-optigreen-500";
                  } else if (log.action === "user_login") {
                    logTitle = "Logged In";
                    color = "bg-optiblue-500";
                  } else if (log.action === "file_upload") {
                    logTitle = "File Uploaded";
                    color = "bg-purple-500";
                  } else if (log.action === "job_complete") {
                    logTitle = "Optimization Complete";
                    color = "bg-emerald-500";
                  } else if (log.action === "file_delete") {
                    logTitle = "Document Deleted";
                    color = "bg-rose-500";
                  }

                  return (
                    <li key={log.id}>
                      <div className="relative pb-8">
                        {logIdx !== recentActivity.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold ring-8 ring-white`}>
                              {logTitle[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-xs font-bold text-slate-700">{logTitle}</p>
                              {log.details?.filename && (
                                <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{log.details.filename}</p>
                              )}
                            </div>
                            <div className="text-right text-[10px] whitespace-nowrap text-slate-400 flex items-center space-x-0.5">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
