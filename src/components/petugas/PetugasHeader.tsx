"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  LogOut,
  RefreshCw,
  Lock,
  BarChart3,
  QrCode,
  Users,
  ShoppingBag,
} from "lucide-react";
import type { AssignedEvent } from "@/services/staffService";

export type PetugasTab = "dashboard" | "checkin" | "visitors" | "offline";

interface PetugasHeaderProps {
  user: any;
  tab: PetugasTab;
  setTab: (tab: PetugasTab) => void;
  assignedEvents: AssignedEvent[];
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  refreshing: boolean;
  canCheckin: boolean;
  canOfflineSales: boolean;
  canViewVisitors: boolean;
  canViewReports: boolean;
  logout: () => void;
  onLogoutRedirect: () => void;
}

export default function PetugasHeader({
  user,
  tab,
  setTab,
  assignedEvents,
  selectedEventId,
  setSelectedEventId,
  refreshing,
  canCheckin,
  canOfflineSales,
  canViewVisitors,
  canViewReports,
  logout,
  onLogoutRedirect,
}: PetugasHeaderProps) {
  const tabs: { id: PetugasTab; label: string; icon: React.ReactNode; allowed: boolean }[] = [
    {
      id: "dashboard",
      label: "Laporan & Statistik",
      icon: <BarChart3 className="w-4 h-4" />,
      allowed: canViewReports,
    },
    {
      id: "checkin",
      label: "Validasi E-Ticket",
      icon: <QrCode className="w-4 h-4" />,
      allowed: canCheckin,
    },
    {
      id: "visitors",
      label: "Daftar Pengunjung",
      icon: <Users className="w-4 h-4" />,
      allowed: canViewVisitors,
    },
    {
      id: "offline",
      label: "Penjualan OTS",
      icon: <ShoppingBag className="w-4 h-4" />,
      allowed: canOfflineSales,
    },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo-tix.png"
              alt="TixGoo Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
            <ShieldCheck className="w-3 h-3" />
            Petugas
          </span>
        </div>

        {/* Event Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium hidden md:inline">Event:</span>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white focus:border-[#111d5e] transition-colors cursor-pointer max-w-[180px] sm:max-w-xs truncate"
          >
            {assignedEvents.map((evt) => {
              const evtId = evt.id || (evt as any).event_id;
              const evtName = evt.name || (evt as any).event_name || "Event Konser";
              return (
                <option key={evtId} value={evtId}>
                  {evtName}
                </option>
              );
            })}
          </select>
          {refreshing && (
            <RefreshCw className="w-3.5 h-3.5 text-gray-400 animate-spin hidden sm:inline" />
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#111d5e]/10 text-[#111d5e] text-xs font-bold flex items-center justify-center shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || "PT"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-gray-900 leading-tight">
                {user?.name}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase">
                Petugas Lapangan
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              onLogoutRedirect();
            }}
            className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Keluar dari Akun"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Tab Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-[#111d5e]/[0.08] text-[#111d5e] font-bold shadow-[inset_0_-2px_0_#111d5e]"
                  : t.allowed
                  ? "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  : "text-gray-400 cursor-not-allowed opacity-60"
              }`}
              title={!t.allowed ? "Anda tidak memiliki hak akses untuk fitur ini" : undefined}
            >
              {t.icon}
              <span>{t.label}</span>
              {!t.allowed && <Lock className="w-3 h-3 text-gray-400 ml-0.5" />}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

