"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { api } from "../../services/api";
import {
  User, Mail, ShieldAlert, CheckCircle, AlertCircle, Loader2, Save, KeyRound
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, token, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    if (!fullName) {
      setError("Please fill in your full name.");
      return;
    }

    if (fullName.trim().length < 3) {
      setError("Full name must be at least 3 characters.");
      return;
    }

    if (password && password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = { full_name: fullName };
      if (password) {
        payload.password = password;
      }

      const res = await api.put("/profile", payload);
      updateUser(res.data);
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update profile. Please try again.");
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
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Profile</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your personal details, email credentials, and secure passwords.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {/* Left column: Summary */}
        <div className="p-8 flex flex-col items-center text-center justify-center space-y-4">
          <div className="h-24 w-24 bg-gradient-to-tr from-optiblue-500 to-optigreen-500 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-slate-100">
            {fullName ? fullName[0].toUpperCase() : "U"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{fullName}</h3>
            <span className="text-xs font-semibold text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">
              {user?.role || "User"}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString([], { month: "long", year: "numeric" }) : "N/A"}
          </p>
        </div>

        {/* Right columns: Fields Form */}
        <div className="p-8 md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-sm text-rose-700 flex items-start space-x-2.5">
                <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-700 flex items-start space-x-2.5">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-optiblue-500 focus:border-transparent transition-all sm:text-sm bg-slate-50/50 hover:bg-slate-50"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-100 rounded-xl text-slate-400 bg-slate-100/50 cursor-not-allowed sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Password changes */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                <KeyRound className="h-4 w-4 text-optiblue-500" />
                <span>Change Password (optional)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-optiblue-500 focus:border-transparent transition-all sm:text-sm bg-slate-50/50 hover:bg-slate-50"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-optiblue-500 focus:border-transparent transition-all sm:text-sm bg-slate-50/50 hover:bg-slate-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center bg-optiblue-600 hover:bg-optiblue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-optiblue-100 transition-colors text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1.5" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
