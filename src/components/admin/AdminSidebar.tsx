"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  ImageIcon,
  Package,
  Users,
  ShieldCheck,
  FileBarChart2,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import type { AdminTab } from "./adminTokens";

interface AdminSidebarProps {
  tab: AdminTab;
  setTab: (tab: AdminTab) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: any;
  logout: () => void;
  onLogoutRedirect: () => void;
}

export default function AdminSidebar({
  tab,
  setTab,
  sidebarOpen,
  setSidebarOpen,
  user,
  logout,
  onLogoutRedirect,
}: AdminSidebarProps) {
  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "overview",
      label: "Overview & Statistik",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "events",
      label: "Manajemen Event",
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      id: "banners",
      label: "Kelola Banner Promo",
      icon: <ImageIcon className="w-4 h-4" />,
    },
    {
      id: "packages",
      label: "Paket Kerja Sama EO",
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: "users",
      label: "Manajemen Pengguna",
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "staff",
      label: "Petugas Lapangan",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: "orders",
      label: "Laporan Penjualan",
      icon: <FileBarChart2 className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Backdrop Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-2xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col bg-white border-r border-gray-100 shadow-xs transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="h-16 sm:h-20 px-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo-tix.png"
              alt="TixGoo Logo"
              className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#111d5e] text-[10px] font-black uppercase tracking-wider border border-blue-100">
              <ShieldCheck className="w-3 h-3" />
              Admin
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? "bg-[#111d5e] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-amber-400" : "text-gray-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#111d5e] text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                {user?.name?.slice(0, 2).toUpperCase() || "AD"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{user?.name || "Admin"}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email || "admin@tixgoo.com"}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                onLogoutRedirect();
              }}
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Keluar dari Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

