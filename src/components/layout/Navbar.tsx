"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { MapPin, ChevronDown, Search, Settings, User, Menu, X, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Location */}
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/" className="flex items-center">
              <span className="font-extrabold text-2xl tracking-tight text-black">LOGO</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors">
              <MapPin className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-semibold text-gray-800">Lokasi event</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Cari event..."
                className="w-full pl-5 pr-12 py-2.5 bg-white border border-gray-300 rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#111d5e] focus:border-transparent transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <Search className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            <Link
              href="/kerjasama"
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Kerja Sama Dengan Kami</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#111d5e] hover:bg-[#0c1543] transition-all">
                  <User className="w-4 h-4" />
                  <span>Akun</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition-colors rounded-b-xl"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#111d5e] hover:bg-[#0c1543] transition-all"
              >
                <User className="w-4 h-4" />
                <span>Akun</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 pt-3 pb-6 space-y-4 shadow-lg">
          <div className="relative w-full mb-4">
            <input
              type="text"
              placeholder="Cari event..."
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#111d5e]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
            <MapPin className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-semibold text-gray-800">Lokasi event: Semua Kota</span>
          </div>

          <Link
            href="/kerjasama"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700"
          >
            <Settings className="w-5 h-5" />
            <span>Kerja Sama Dengan Kami</span>
          </Link>
          
          <div className="pt-3 border-t border-gray-100">
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-2">
                <div>
                  <p className="font-bold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold bg-[#111d5e] text-white"
              >
                <User className="w-5 h-5" />
                <span>Masuk Akun</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

