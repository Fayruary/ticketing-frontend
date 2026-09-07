"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, ChevronDown, Search, Settings, User, Menu, X, LogOut } from "lucide-react";
import useAuth from "@/hooks/useAuth";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Semua Kota");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const locations = ["Semua Kota", "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Bali"];

  return (
    <header className={`sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Location Selector */}
          <div className="flex items-center gap-6 shrink-0">
            {/* TixGoo Brand Logo */}
            <Link href="/" className="flex items-center gap-1.5 group">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-2xl font-black tracking-tight text-[#111d5e] flex items-center">
                    <span className="text-blue-600 mr-0.5">✦</span>Tix<span className="text-blue-500">Goo</span>
                  </span>
                </div>
                <span className="text-[7px] tracking-widest uppercase font-bold text-gray-400 -mt-1">
                  LET&apos;S ENJOY THE SHOW
                </span>
              </div>
            </Link>

            {/* Location Dropdown */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors py-1.5 px-2 rounded-lg hover:bg-gray-50 focus:outline-none"
              >
                <MapPin className="w-4 h-4 text-gray-600" />
                <span>Lokasi event</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showLocationDropdown && (
                <div className="absolute left-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setShowLocationDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder=""
                className="w-full pl-5 pr-12 py-2 bg-white border border-gray-300 rounded-full text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
              <button
                type="button"
                aria-label="Search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Navigation & Actions */}
          <div className="hidden md:flex items-center gap-5 shrink-0">
            <Link
              href="/kerjasama"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-600" />
              <span>Kerja Sama Dengan Kami</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-[#111d5e] hover:bg-[#0c1543] transition-all shadow-sm"
                >
                  <User className="w-4 h-4" />
                  <span>Akun</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-gray-50 transition-colors rounded-b-xl"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-[#111d5e] hover:bg-[#0c1543] transition-all shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Akun</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="relative w-full mb-2">
            <input
              type="text"
              placeholder="Cari event..."
              className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-semibold text-gray-800">
              Lokasi event: {selectedLocation}
            </span>
          </div>

          <Link
            href="/kerjasama"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-700"
          >
            <Settings className="w-4 h-4 text-gray-600" />
            <span>Kerja Sama Dengan Kami</span>
          </Link>

          <div className="pt-2 border-t border-gray-100">
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-2">
                <div>
                  <p className="text-xs font-bold text-gray-900">{user?.name}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold bg-[#111d5e] text-white text-xs"
              >
                <User className="w-4 h-4" />
                <span>Masuk Akun</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
