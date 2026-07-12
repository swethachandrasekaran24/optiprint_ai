"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { api } from "../../services/api";
import {
  Settings, CheckCircle, AlertCircle, Loader2, Save, Sparkles, Sliders, Bell
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, updateUser } = useAuthStore();

  const [theme, setTheme] = useState("light");
  const [optWhitespace, setOptWhitespace] = useState(true);
  const [optMargins, setOptMargins] = useState(true);
  const [optSpacing, setOptSpacing] = useState(true);
  const [optImages, setOptImages] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user && user.preferences) {
      setTheme(user.preferences.theme || "light");
      setOptWhitespace(user.preferences.default_optimize_whitespace !== false);
      setOptMargins(user.preferences.default_optimize_margins !== false);
      setOptSpacing(user.preferences.default_optimize_spacing !== false);
      setOptImages(user.preferences.default_optimize_images !== false);
      setNotifications(user.preferences.notifications_enabled !== false);
    }
  }, [isAuthenticated, user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError("");
    setLoading(true);

    try {
      const payload = {
        preferences: {
          theme,
          default_optimize_whitespace: optWhitespace,
          default_optimize_margins: optMargins,
          default_optimize_spacing: optSpacing,
          default_optimize_images: optImages,
          notifications_enabled: notifications
        }
      };

      const res = await api.put("/profile", payload);
      updateUser(res.data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update preferences. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-6 bg-white rounded-3xl shadow border border-slate-100 max-w-sm">
          <Loader2 className="animate-spin h-8 w-8 text-optiblue-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Loading...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Optimization Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Customize your default pre-print layout rules, margins, structural squeezing preferences, and notification triggers.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-sm text-rose-700 flex items-start space-x-2.5">
            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-700 flex items-start space-x-2.5">
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>Preferences saved successfully! All future uploads will follow these rules.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Preferences Summary */}
          <div className="bg-slate-950 p-6 text-white rounded-3xl flex flex-col justify-between border border-slate-900 shadow-xl h-80 relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <span className="text-xs font-bold text-optigreen-500 uppercase tracking-wider block">Rule Configurator</span>
              <h3 className="text-xl font-bold tracking-tight">Default Workspace Rules</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                OptiPrint AI adapts to your printing needs. Adjust margins if you have custom binding requirements, or squeeze white space entirely to save paper.
              </p>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-400 relative z-10">
              <Sparkles className="h-5 w-5 text-optigreen-500 pulse-slow" />
              <span>Rules write straight to MongoDB.</span>
            </div>
            {/* background blur decorations */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-optigreen-600/20 blur-2xl rounded-full" />
          </div>

          {/* Right Panel: Checkbox cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Optimization settings */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-50 pb-4">
                <Sliders className="h-5 w-5 text-optiblue-500" />
                <span>Default AI Optimizations</span>
              </h3>

              <div className="space-y-4">
                {/* Spacing optimization toggle */}
                <label className="flex items-start space-x-3.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={optWhitespace}
                    onChange={(e) => setOptWhitespace(e.target.checked)}
                    className="mt-1 h-4.5 w-4.5 text-optiblue-600 border-slate-300 rounded focus:ring-optiblue-500 focus:outline-none"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Whitespace Compression</span>
                    <span className="text-xs text-slate-400 mt-0.5 block">AI scans for bloated empty gaps, double line breaks, and page overflows to squeeze spacing.</span>
                  </div>
                </label>

                {/* Margin optimization toggle */}
                <label className="flex items-start space-x-3.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={optMargins}
                    onChange={(e) => setOptMargins(e.target.checked)}
                    className="mt-1 h-4.5 w-4.5 text-optiblue-600 border-slate-300 rounded focus:ring-optiblue-500 focus:outline-none"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Dynamic Margin Reductions</span>
                    <span className="text-xs text-slate-400 mt-0.5 block">Reduces original page margin padding (down to safe 0.75 in) to fit text content grids.</span>
                  </div>
                </label>

                {/* Word spacing toggle */}
                <label className="flex items-start space-x-3.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={optSpacing}
                    onChange={(e) => setOptSpacing(e.target.checked)}
                    className="mt-1 h-4.5 w-4.5 text-optiblue-600 border-slate-300 rounded focus:ring-optiblue-500 focus:outline-none"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Line Height Optimization</span>
                    <span className="text-xs text-slate-400 mt-0.5 block">Adjusts text document line height formatting (e.g. from loose 1.5 to highly readable 1.15).</span>
                  </div>
                </label>

                {/* Image layout scaling */}
                <label className="flex items-start space-x-3.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={optImages}
                    onChange={(e) => setOptImages(e.target.checked)}
                    className="mt-1 h-4.5 w-4.5 text-optiblue-600 border-slate-300 rounded focus:ring-optiblue-500 focus:outline-none"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Image and Graphic Rescaling</span>
                    <span className="text-xs text-slate-400 mt-0.5 block">Restructures oversized chart and image dimensions so they fit neatly inside columns.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 2: General settings */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-50 pb-4">
                <Bell className="h-5 w-5 text-optigreen-500" />
                <span>General & Notifications</span>
              </h3>

              <div className="space-y-4">
                {/* Theme Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Default UI Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="appearance-none block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-optiblue-500 focus:border-transparent transition-all text-sm bg-slate-50/50 hover:bg-slate-50"
                  >
                    <option value="light">Light UI Theme (Recommended)</option>
                    <option value="dark">Dark UI Theme</option>
                  </select>
                </div>

                {/* Notifications */}
                <label className="flex items-start space-x-3.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="mt-1 h-4.5 w-4.5 text-optiblue-600 border-slate-300 rounded focus:ring-optiblue-500 focus:outline-none"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Enable Email Updates</span>
                    <span className="text-xs text-slate-400 mt-0.5 block">Receive notifications when your bulk document reports complete processing.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Trigger Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center bg-optiblue-600 hover:bg-optiblue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-optiblue-100 transition-colors text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
                    Saving Configuration...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1.5" />
                    Save Rule Changes
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
