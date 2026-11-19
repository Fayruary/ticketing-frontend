"use client";

import React, { useState } from "react";
import { Lock, Users, RefreshCw, Search } from "lucide-react";

interface PetugasVisitorsTabProps {
  canViewVisitors: boolean;
  checkinHistory: any[];
  onRefresh: () => void;
  refreshing: boolean;
}

export default function PetugasVisitorsTab({
  canViewVisitors,
  checkinHistory,
  onRefresh,
  refreshing,
}: PetugasVisitorsTabProps) {
  const [search, setSearch] = useState("");

  if (!canViewVisitors) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-gray-200 text-center space-y-3 max-w-xl mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-gray-900 text-base">Akses Riwayat Pengunjung Dibatasi</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Akun Anda tidak memiliki izin <strong>view_visitors</strong> pada event ini. Hubungi Administrator untuk mengaktifkan izin ini.
        </p>
      </div>
    );
  }

  const filteredHistory = checkinHistory.filter((v: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (v.ticket_code && v.ticket_code.toLowerCase().includes(q)) ||
      (v.visitor_name && v.visitor_name.toLowerCase().includes(q)) ||
      (v.ticket_category && v.ticket_category.toLowerCase().includes(q)) ||
      (v.staff_name && v.staff_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div>
          <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Daftar Pengunjung Telah Check-In
          </h3>
          <p className="text-xs text-gray-500">
            Total {checkinHistory.length} pengunjung hadir dan telah masuk venue
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode atau nama..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#111d5e]"
            />
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Segarkan
          </button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-10">
          {search ? "Tidak ada pengunjung yang cocok dengan pencarian." : "Belum ada pengunjung yang melakukan check-in pada event ini."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-bold bg-gray-50/50">
                <th className="py-2.5 px-3">Kode Tiket</th>
                <th className="py-2.5 px-3">Nama Pengunjung</th>
                <th className="py-2.5 px-3">Kategori Tiket</th>
                <th className="py-2.5 px-3">Waktu Masuk</th>
                <th className="py-2.5 px-3 text-right">Petugas Validator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHistory.map((v: any) => (
                <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono text-[#111d5e] font-bold">
                    {v.ticket_code}
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-900">
                    {v.visitor_name || "Pengunjung"}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                      {v.ticket_category || "General Pass"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500">
                    {v.checkin_time
                      ? new Date(v.checkin_time).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "-"}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-600 font-medium">
                    {v.staff_name || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

