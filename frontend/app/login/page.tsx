"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { Mail, Lock, Loader2, AlertCircle, CheckCircle, Printer } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading, error, setError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Clean error state on mount
  useEffect(() => {
    setError(null);
  }, [setError]);

  // If already logged in, send to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setError(null);

    // Simple validation
    if (!email || !password) {
      setValidationError("Please fill out all required fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    try {
      await login({ email, password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      // Handled by store state
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden">
        {/* Decorative corner circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-optiblue-50 rounded-full translate-x-12 -translate-y-12 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-optigreen-50 rounded-full -translate-x-12 translate-y-12 pointer-events-none" />

        <div className="text-center relative z-10">
          <div className="inline-flex p-3 bg-gradient-to-tr from-optiblue-600 to-optigreen-500 rounded-2xl text-white shadow-md shadow-optiblue-100">
            <Printer className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back!
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to start optimizing documents and saving trees.
          </p>
        </div>

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          {/* Error Banner */}
          {(validationError || error) && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-sm text-rose-700 flex items-start space-x-2.5">
              <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{validationError || error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-700 flex items-start space-x-2.5">
              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>Authentication successful! Launching dashboard...</span>
            </div>
          )}

          <div className="rounded-md space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || success}
                  className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-optiblue-500 focus:border-transparent transition-all sm:text-sm bg-slate-50/50 hover:bg-slate-50"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                  className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-optiblue-500 focus:border-transparent transition-all sm:text-sm bg-slate-50/50 hover:bg-slate-50"
                  placeholder="••••••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-optiblue-600 hover:bg-optiblue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-optiblue-500 shadow-lg shadow-optiblue-100 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        <div className="text-center relative z-10">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-optigreen-600 hover:text-optigreen-700 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
