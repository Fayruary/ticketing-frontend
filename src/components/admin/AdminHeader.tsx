"use client";

import React from "react";
import { Menu, ShieldCheck, Sparkles } from "lucide-react";
import type { AdminTab } from "./adminTokens";

interface AdminHeaderProps {
  tab: AdminTab;
  setSidebarOpen: (open: boolean) => void;
  user: any;
}

const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: {
    title: "Overview & Statistik Platform",
    subtitle: "Ringkasan performa penjualan tiket, pendapatan, dan aktivitas event.",
  },
  events: {
    title: "Manajemen Event & Tiket",
    subtitle: "Buat, kelola konser musik, kategori tiket, kuota, dan publish event.",
  },
  banners: {
    title: "Kelola Banner Promo & Slider Homepage",
    subtitle: "Atur banner promosi yang tampil bergiliran di halaman utama pengunjung.",
  },
  packages: {
    title: "Paket Kerja Sama Event Organizer",
    subtitle: "Kelola paket kemitraan sistem tiket untuk EO dan promotor acara.",
  },
  users: {
    title: "Manajemen Pengguna & Akun",
    subtitle: "Pantau daftar akun terdaftar, hak akses peran (Admin, Petugas, User).",
  },
  staff: {
    title: "Penugasan Petugas Lapangan",
    subtitle: "Tugaskan petugas ke event tertentu dengan izin operasional gerbang masuk.",
  },
  orders: {
    title: "Laporan Pesanan & Penjualan Tiket",
    subtitle: "Daftar seluruh transaksi pemesanan tiket online dan status pembayaran.",
  },
};

export default function AdminHeader({ tab, setSidebarOpen, user }: AdminHeaderProps) {
  const current = tabTitles[tab] || { title: "Admin Portal", subtitle: "" };

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-20 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-black text-gray-900 tracking-tight leading-tight">
            {current.title}
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#111d5e] text-xs font-bold border border-blue-100">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>TixGoo Admin</span>
        </div>
      </div>
    </header>
  );
}

