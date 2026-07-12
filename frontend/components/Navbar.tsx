"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { Printer, Menu, X, LayoutDashboard, UploadCloud, FileText, User, Settings as SettingsIcon, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    router.push("/");
  };

  const isActive = (path: string) => pathname === path;

  const authLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload File", href: "/upload", icon: UploadCloud },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-tr from-optiblue-600 to-optigreen-500 rounded-lg text-white">
                <Printer className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                Opti<span className="text-optigreen-600">Print</span> <span className="text-optiblue-500 font-semibold">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                {authLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? "bg-optiblue-50 text-optiblue-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
                <div className="h-5 w-px bg-slate-200 mx-2" />
                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">
                  {user?.full_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-optiblue-600 hover:bg-optiblue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm shadow-optiblue-100 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-slate-500 p-2 rounded-md hover:bg-slate-50 transition-colors"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-2 pt-2 pb-4 space-y-1 shadow-inner">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 border-b border-slate-50 mb-1">
                <p className="text-sm font-bold text-slate-800">{user?.full_name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              {authLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-base font-medium ${
                      isActive(link.href)
                        ? "bg-optiblue-50 text-optiblue-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-3 py-2.5 text-base font-medium text-rose-600 hover:bg-rose-50 rounded-lg text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="block text-slate-600 hover:bg-slate-50 px-3 py-2.5 rounded-lg text-base font-medium"
              >
                Home
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-slate-600 hover:bg-slate-50 px-3 py-2.5 rounded-lg text-base font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="block bg-optiblue-600 text-white text-center px-4 py-2.5 rounded-lg text-base font-semibold shadow-sm shadow-optiblue-100"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
