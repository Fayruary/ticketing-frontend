"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type AdminTab = "overview" | "events" | "staff" | "banners" | "packages" | "users" | "orders";

export const PAGE_SIZE = 5;

/** Biaya layanan website per order lunas (Rp). Pendapatan platform dihitung dari ini. */
export const SERVICE_FEE = 5000;

export const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80";

/* ---------- Design tokens ---------- */
export const UI = {
  card: "bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(17,29,94,0.06)]",
  input:
    "w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#111d5e] focus:ring-1 focus:ring-[#111d5e]",
  label: "block text-sm font-medium text-gray-700 mb-1",
  hint: "text-xs text-gray-500 mt-1",
  btn: "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#111d5e] hover:bg-[#0c1543] disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer",
  btnGhost:
    "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer",
  btnLink: "text-sm font-medium text-[#111d5e] hover:underline cursor-pointer",
  iconBtn: "p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer",
  iconBtnDanger: "p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer",
  th: "px-5 py-3 text-left text-xs font-medium text-gray-500",
  td: "px-5 py-3.5 text-sm text-gray-700",
};

export const TONE: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
  gray: "bg-gray-100 text-gray-600",
};

export const DOT: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
  gray: "bg-gray-400",
};

export const TAB_DESC: Record<AdminTab, string> = {
  overview: "Gambaran singkat performa penjualan dan aktivitas platform.",
  events: "Buat, publikasikan, dan atur tiket untuk setiap event.",
  staff: "Kelola akun petugas, penugasan ke event, hak akses, dan status keaktifan.",
  banners: "Atur banner yang tampil di beranda.",
  packages: "Paket yang ditawarkan kepada event organizer.",
  users: "Daftar akun yang terdaftar di TixGoo.",
  orders: "Semua transaksi pembelian tiket.",
};

/* ---------- Pagination Hook ---------- */
export function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const current = Math.min(page, totalPages);
  const pageItems = items.slice((current - 1) * pageSize, current * pageSize);

  return { page: current, setPage, totalPages, pageItems, total: items.length, pageSize };
}

/* ---------- Pagination UI Component ---------- */
export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
  inCard = false,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
  inCard?: boolean;
}) {
  if (total <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const btn =
    "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 shadow-xs hover:bg-gray-50 hover:text-gray-900 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:active:scale-100 cursor-pointer";

  return (
    <nav
      aria-label="Navigasi halaman"
      className={`flex items-center justify-between gap-3 ${
        inCard ? "px-5 py-3 border-t border-gray-100" : "pt-1"
      }`}
    >
      <p className="text-sm text-gray-500">
        Menampilkan <span className="font-medium text-gray-700">{from} - {to}</span> dari{" "}
        <span className="font-medium text-gray-700">{total}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          aria-label="Halaman sebelumnya"
          title="Sebelumnya"
          className={btn}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span
          aria-live="polite"
          aria-label={`Halaman ${page} dari ${totalPages}`}
          className="inline-flex items-center justify-center h-9 min-w-9 px-3 rounded-lg bg-[#111d5e] text-white text-sm font-medium tabular-nums"
        >
          {page}
        </span>

        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Halaman berikutnya"
          title="Berikutnya"
          className={btn}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}

/* ---------- Shared Building Blocks ---------- */
export function Badge({
  tone,
  children,
}: {
  tone: keyof typeof TONE;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${TONE[tone] || TONE.gray}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${DOT[tone] || DOT.gray}`} />
      {children}
    </span>
  );
}

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={UI.label}>{label}</label>
      {children}
    </div>
  );
}

export function Table({
  head,
  children,
  empty,
  footer,
}: {
  head: { label: string; align?: "right" | "center" }[];
  children: React.ReactNode;
  empty?: string;
  footer?: React.ReactNode;
}) {
  const hasRows = React.Children.count(children) > 0;
  return (
    <div className={`${UI.card} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {head.map((h) => (
                <th
                  key={h.label}
                  className={`${UI.th} ${
                    h.align === "right" ? "text-right" : h.align === "center" ? "text-center" : ""
                  }`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">{children}</tbody>
        </table>
      </div>
      {!hasRows && <p className="text-sm text-gray-500 text-center py-10">{empty || "Belum ada data."}</p>}
      {footer}
    </div>
  );
}

export function FormPanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`${UI.card} p-6`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {onClose && (
          <button onClick={onClose} className={UI.iconBtn} aria-label="Tutup">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function RupiahInput({
  value,
  onChange,
}: {
  value?: number;
  onChange: (n: number) => void;
}) {
  const display = value ? new Intl.NumberFormat("id-ID").format(value) : "";
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        placeholder="0"
        value={display}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
        className={`${UI.input} pl-9 tabular-nums`}
      />
    </div>
  );
}

export function SectionBar({
  text,
  action,
}: {
  text: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm text-gray-500">{text}</div>
      {action}
    </div>
  );
}
