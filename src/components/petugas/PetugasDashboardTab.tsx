"use client";

import React from "react";
import { Lock } from "lucide-react";
import type { PetugasDashboard } from "@/services/dashboardService";

interface PetugasDashboardTabProps {
  canViewReports: boolean;
  dashboard: PetugasDashboard | null;
}

export default function PetugasDashboardTab({
  canViewReports,
  dashboard,
}: PetugasDashboardTabProps) {
  if (!canViewReports) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-gray-200 text-center space-y-3 shadow-xs max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-gray-900 text-base">Akses Dashboard Laporan Dibatasi</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Akun Anda tidak memiliki izin <strong>view_reports</strong> pada event ini. Hubungi Admin untuk membuka akses laporan.
        </p>
      </div>
    );
  }

  const attendancePercentage =
    dashboard && dashboard.total_tickets > 0
      ? Math.round((dashboard.checked_in / dashboard.total_tickets) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: "Total Tiket Terjual", value: dashboard?.total_tickets ?? 0, color: "text-[#111d5e]" },
          { label: "Penjualan Online", value: dashboard?.online_tickets ?? 0, color: "text-blue-600" },
          { label: "Penjualan Offline OTS", value: dashboard?.offline_tickets ?? 0, color: "text-amber-600" },
          { label: "Sudah Check-In", value: dashboard?.checked_in ?? 0, color: "text-emerald-600" },
          { label: "Belum Check-In", value: dashboard?.not_checked_in ?? 0, color: "text-rose-600" },
          { label: "Sisa Kapasitas", value: dashboard?.remaining_tickets ?? 0, color: "text-gray-700" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs flex flex-col items-center text-center"
          >
            <span className={`text-2xl font-black tabular-nums ${stat.color}`}>{stat.value}</span>
            <span className="text-[11px] text-gray-500 font-semibold mt-1 leading-tight">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress Kehadiran */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-gray-700">Tingkat Kehadiran Pengunjung Venue:</span>
          <span className="font-black text-emerald-600 text-sm">{attendancePercentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-3.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, attendancePercentage)}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400">
          Dari total {dashboard?.total_tickets ?? 0} tiket terjual, sebanyak {dashboard?.checked_in ?? 0} pengunjung telah hadir dan masuk gerbang venue.
        </p>
      </div>
    </div>
  );
}

