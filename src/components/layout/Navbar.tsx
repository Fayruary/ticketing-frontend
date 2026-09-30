"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, ChevronDown, Search, Settings, User, Menu, X, LogOut, Ticket, ShoppingBag } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Semua Kota");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const locations = ["Semua Kota", "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Bali", "Medan", "Semarang"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  return (
    <header className={`sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Location Selector */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* TixGoo Brand Logo */}
            <Link href="/" className="flex items-center group py-1">
              <img
                src="/logo-tix.png"
                alt="TixGoo Logo"
                className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>

            {/* Location Dropdown */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors py-1.5 px-2 rounded-lg hover:bg-gray-50 focus:outline-none"
              >
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="hidden lg:inline">{selectedLocation}</span>
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
                      className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                        selectedLocation === loc ? "text-blue-600 font-bold" : "text-gray-700"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari event, konser, artis..."
                className="w-full pl-5 pr-12 py-2 bg-white border border-gray-300 rounded-full text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Navigation & Actions */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <Link
              href="/kerjasama"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-600" />
              <span>Kerja Sama</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/tickets"
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Tiket Saya</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#111d5e] hover:bg-[#0c1543] transition-all shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">{user?.name?.split(" ")[0] || "Akun"}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
                      </div>
                      {user?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors font-medium border-b border-gray-50"
                        >
                          Dashboard Admin
                        </Link>
                      )}
                      {user?.role === "petugas" && (
                        <Link
                          href="/petugas"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors font-medium border-b border-gray-50"
                        >
                          Portal Petugas
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-gray-50 transition-colors rounded-b-xl"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#111d5e] border border-[#111d5e] hover:bg-[#111d5e] hover:text-white transition-all"
                >
                  Daftar
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#111d5e] hover:bg-[#0c1543] transition-all shadow-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </Link>
              </div>
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
          <form onSubmit={handleSearch} className="relative w-full mb-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari event..."
              className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button type="submit">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </button>
          </form>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-semibold text-gray-800">
              Lokasi: {selectedLocation}
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
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 py-1">
                  <div className="w-8 h-8 rounded-full bg-[#111d5e] flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{user?.name}</p>
                    <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
                <Link
                  href="/tickets"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-700"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Tiket Saya</span>
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-700"
                  >
                    Dashboard Admin
                  </Link>
                )}
                {user?.role === "petugas" && (
                  <Link
                    href="/petugas"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-700"
                  >
                    Portal Petugas
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-red-50 text-xs font-bold text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-[#111d5e] text-[#111d5e] font-bold text-xs text-center"
                >
                  Daftar
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 rounded-xl font-bold bg-[#111d5e] text-white text-xs text-center"
                >
                  Masuk
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
