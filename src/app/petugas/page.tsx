"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { getPetugasDashboard, type PetugasDashboard } from "@/services/dashboardService";
import { getMyAssignedEvents, type AssignedEvent } from "@/services/staffService";
import { getTicketCategories, type TicketCategory } from "@/services/ticketService";
import { checkinTicket, getEventCheckins, type CheckinResponse } from "@/services/checkinService";
import { createOfflineSale, getEventOfflineSales, type OfflineSale } from "@/services/offlineSaleService";
import { formatDate, formatRupiah } from "@/lib/utils";
import {
  Ticket, ScanLine, QrCode, ShieldCheck, CheckCircle2, AlertCircle, XCircle,
  Users, LogOut, Activity, BarChart3, ShoppingBag, User, Phone, Mail,
  ChevronDown, Sparkles, Menu, X, Clock, Wifi, Lock, RefreshCw, CreditCard
} from "lucide-react";

type PetugasTab = "dashboard" | "checkin" | "visitors" | "offline";

export default function PetugasPage() {
  const router = useRouter();
  const { user, isAuthenticated, role, loading: authLoading, logout } = useAuth();

  const [tab, setTab] = useState<PetugasTab>("dashboard");

  // Data Penugasan & Event
  const [assignedEvents, setAssignedEvents] = useState<AssignedEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [dashboard, setDashboard] = useState<PetugasDashboard | null>(null);
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [checkinHistory, setCheckinHistory] = useState<any[]>([]);
  const [offlineSales, setOfflineSales] = useState<OfflineSale[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check-in state
  const [ticketCode, setTicketCode] = useState("");
  const [checkinResult, setCheckinResult] = useState<CheckinResponse | null>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);

  // Offline sale form state
  const [offlineForm, setOfflineForm] = useState({
    buyer_name: "",
    phone: "",
    buyer_email: "",
    payment_method: "cash" as "cash" | "qris" | "transfer",
    ticket_category_id: "",
    quantity: 1,
  });
  const [offlineLoading, setOfflineLoading] = useState(false);
  const [offlineSuccess, setOfflineSuccess] = useState<string | null>(null);
  const [offlineError, setOfflineError] = useState<string | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== "petugas")) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, role]);

  // Load Initial Assigned Events
  useEffect(() => {
    if (isAuthenticated && role === "petugas") {
      fetchInitialAssignedEvents();
    }
  }, [isAuthenticated, role]);

  // Load Event Specific Data when selectedEventId changes
  useEffect(() => {
    if (selectedEventId) {
      fetchEventData(selectedEventId);
    }
  }, [selectedEventId]);

  // Event & Permission Resolution
  const selectedEvent = assignedEvents.find(
    (e) => e.id === selectedEventId || (e as any).event_id === selectedEventId
  );
  const currentPermissions: string[] = selectedEvent?.permissions || [];
  const canCheckin = currentPermissions.includes("checkin");
  const canOfflineSales = currentPermissions.includes("offline_sales");
  const canViewVisitors = currentPermissions.includes("view_visitors");
  const canViewReports = currentPermissions.includes("view_reports");

  // Otomatis sesuaikan tab aktif jika permission tidak mencakup tab yang dipilih
  useEffect(() => {
    if (!selectedEvent) return;

    if (tab === "dashboard" && !canViewReports) {
      if (canCheckin) setTab("checkin");
      else if (canViewVisitors) setTab("visitors");
      else if (canOfflineSales) setTab("offline");
    } else if (tab === "checkin" && !canCheckin) {
      if (canViewReports) setTab("dashboard");
      else if (canViewVisitors) setTab("visitors");
      else if (canOfflineSales) setTab("offline");
    } else if (tab === "visitors" && !canViewVisitors) {
      if (canViewReports) setTab("dashboard");
      else if (canCheckin) setTab("checkin");
      else if (canOfflineSales) setTab("offline");
    } else if (tab === "offline" && !canOfflineSales) {
      if (canViewReports) setTab("dashboard");
      else if (canCheckin) setTab("checkin");
      else if (canViewVisitors) setTab("visitors");
    }
  }, [selectedEventId, currentPermissions, tab, canViewReports, canCheckin, canViewVisitors, canOfflineSales]);

  // Fetch penugasan event petugas yang login
  const fetchInitialAssignedEvents = async () => {
    try {
      setLoading(true);
      const res = await getMyAssignedEvents();
      const eventsList = Array.isArray(res) ? res : [];
      setAssignedEvents(eventsList);

      if (eventsList.length > 0) {
        // Pilih event pertama jika belum ada yang terpilih
        const firstId = eventsList[0].id || (eventsList[0] as any).event_id;
        setSelectedEventId((prev) =>
          prev && eventsList.some((e) => e.id === prev || (e as any).event_id === prev)
            ? prev
            : firstId
        );
      } else {
        setSelectedEventId("");
      }
    } catch (err) {
      console.error("Error loading assigned events:", err);
      setAssignedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data spesifik untuk event yang dipilih berdasarkan permissions yang dimiliki
  const fetchEventData = async (eventId: string) => {
    const evt = assignedEvents.find(
      (e) => e.id === eventId || (e as any).event_id === eventId
    );
    const perms = evt?.permissions || [];

    // Bersihkan data event sebelumnya secara langsung saat berganti event
    setDashboard(null);
    setCheckinHistory([]);
    setOfflineSales([]);
    setTicketCategories([]);

    try {
      setRefreshing(true);
      const promises: Promise<any>[] = [];

      // 1. Dashboard (jika punya izin view_reports)
      if (perms.includes("view_reports")) {
        promises.push(
          getPetugasDashboard(eventId)
            .then((res) => setDashboard(res))
            .catch(() => setDashboard(null))
        );
      } else {
        setDashboard(null);
      }

      // 2. Kategori tiket (untuk form OTS jika punya izin offline_sales)
      if (perms.includes("offline_sales")) {
        promises.push(
          getTicketCategories(eventId)
            .then((res: any) => setTicketCategories(Array.isArray(res) ? res : res?.data || []))
            .catch(() => setTicketCategories([]))
        );
        promises.push(
          getEventOfflineSales(eventId)
            .then((res) => setOfflineSales(Array.isArray(res) ? res : []))
            .catch(() => setOfflineSales([]))
        );
      } else {
        setTicketCategories([]);
        setOfflineSales([]);
      }

      // 3. Riwayat pengunjung check-in (jika punya izin view_visitors)
      if (perms.includes("view_visitors")) {
        promises.push(
          getEventCheckins(eventId)
            .then((res: any) => setCheckinHistory(Array.isArray(res) ? res : res?.data || []))
            .catch(() => setCheckinHistory([]))
        );
      } else {
        setCheckinHistory([]);
      }

      await Promise.allSettled(promises);
    } catch (err) {
      console.error("Error loading event data:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Handler Check-in Tiket
  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode.trim() || !canCheckin) return;
    try {
      setCheckinLoading(true);
      setCheckinResult(null);
      const result = await checkinTicket(ticketCode.trim());
      setCheckinResult(result as any);

      // Refresh data pengunjung dan dashboard jika ada izinnya
      if (selectedEventId) {
        fetchEventData(selectedEventId);
      }
      setTicketCode("");
    } catch (err: any) {
      setCheckinResult({
        success: false,
        message: err.message || "Tiket tidak valid, sudah dipakai, atau Anda tidak ditugaskan pada event ini",
      });
    } finally {
      setCheckinLoading(false);
    }
  };

  // Handler Penjualan Offline OTS
  const handleOfflineSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !canOfflineSales) return;
    try {
      setOfflineLoading(true);
      setOfflineError(null);
      setOfflineSuccess(null);

      // Kirim data penjualan OTS (payment_status dikelola aman oleh backend)
      await createOfflineSale({
        event_id: selectedEventId,
        buyer_name: offlineForm.buyer_name.trim(),
        phone: offlineForm.phone.trim(),
        buyer_email: offlineForm.buyer_email ? offlineForm.buyer_email.trim() : undefined,
        payment_method: offlineForm.payment_method,
        ticket_category_id: offlineForm.ticket_category_id,
        quantity: offlineForm.quantity,
      });

      setOfflineSuccess("Penjualan tiket offline berhasil diproses! E-Ticket OTS telah diterbitkan.");
      setOfflineForm({
        buyer_name: "",
        phone: "",
        buyer_email: "",
        payment_method: "cash",
        ticket_category_id: "",
        quantity: 1,
      });

      // Muat ulang stok kategori tiket dan riwayat penjualan
      fetchEventData(selectedEventId);
    } catch (err: any) {
      setOfflineError(err.message || "Gagal memproses transaksi penjualan offline");
    } finally {
      setOfflineLoading(false);
    }
  };

  const selectedCategory = ticketCategories.find((c) => c.id === offlineForm.ticket_category_id);
  const offlineTotal = selectedCategory ? Number(selectedCategory.price) * offlineForm.quantity : 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f5fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#111d5e] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Memverifikasi penugasan petugas...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || role !== "petugas") return null;

  // Tampilan ketika Petugas belum memiliki penugasan event sama sekali
  if (assignedEvents.length === 0) {
    return (
      <div className="min-h-screen bg-[#f3f5fa] text-gray-900 flex flex-col justify-between">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center">
              <img src="/logo-tix.png" alt="TixGoo Logo" className="h-8 w-auto object-contain" />
            </Link>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Portal Petugas Lapangan
            </span>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar
          </button>
        </header>

        <main className="max-w-md mx-auto p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Belum Ada Event Ditugaskan</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Halo <strong>{user?.name}</strong>, akun petugas Anda saat ini belum memiliki penugasan event yang aktif.
            Silakan hubungi Administrator untuk mengatur penugasan event dan hak akses operasional Anda.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={fetchInitialAssignedEvents}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111d5e] hover:bg-[#111d5e]/90 text-xs font-semibold text-white transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Periksa Ulang Penugasan
            </button>
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-200">
          TixGoo Event Operations System
        </footer>
      </div>
    );
  }

  // Definisi Navigasi Tab berdasarkan permissions
  const tabs: { id: PetugasTab; label: string; icon: React.ReactNode; allowed: boolean }[] = [
    {
      id: "dashboard",
      label: "Dashboard Laporan",
      icon: <BarChart3 className="w-4 h-4" />,
      allowed: canViewReports,
    },
    {
      id: "checkin",
      label: "Scan QR Check-In",
      icon: <ScanLine className="w-4 h-4" />,
      allowed: canCheckin,
    },
    {
      id: "visitors",
      label: "Riwayat Pengunjung",
      icon: <Users className="w-4 h-4" />,
      allowed: canViewVisitors,
    },
    {
      id: "offline",
      label: "Penjualan Offline OTS",
      icon: <ShoppingBag className="w-4 h-4" />,
      allowed: canOfflineSales,
    },
  ];

  const currentEventTitle =
    selectedEvent?.name || (selectedEvent as any)?.event_name || "Event Konser";

  return (
    <div className="min-h-screen bg-[#f3f5fa] text-gray-900 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center">
              <img
                src="/logo-tix.png"
                alt="TixGoo Logo"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#111d5e] border border-blue-100 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Petugas</span>
            </span>
          </div>

          {/* Event Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium hidden md:inline">Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white focus:border-[#111d5e] transition-colors cursor-pointer max-w-[200px] sm:max-w-xs truncate"
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
                <span className="text-xs font-semibold text-gray-900 leading-tight">{user?.name}</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Petugas Lapangan</span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Keluar dari Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Permission-based Tab Navigation */}
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

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Event Header Banner & Active Permissions */}
        {selectedEvent && (
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="font-bold text-lg text-gray-900">{currentEventTitle}</h2>
              </div>
              <p className="text-xs text-gray-500">
                {formatDate(selectedEvent.event_date)} • {selectedEvent.venue || "Venue Konser"} • {selectedEvent.city || ""}
              </p>
            </div>

            {/* Badges Izin Operasional Petugas untuk Event ini */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-500 font-medium mr-1">Izin Anda:</span>
              {canCheckin && (
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ Check-in
                </span>
              )}
              {canOfflineSales && (
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  ✓ Penjualan OTS
                </span>
              )}
              {canViewVisitors && (
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  ✓ Pengunjung
                </span>
              )}
              {canViewReports && (
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  ✓ Laporan
                </span>
              )}
              {currentPermissions.length === 0 && (
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  Belum ada izin operasional
                </span>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 1. DASHBOARD & LAPORAN STATISTIK (Permission: view_reports)    */}
        {/* ============================================================== */}
        {tab === "dashboard" && (
          <>
            {!canViewReports ? (
              <div className="p-8 rounded-2xl bg-white border border-gray-200 text-center space-y-3 shadow-sm max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Akses Dashboard Laporan Dibatasi</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Akun Anda tidak memiliki izin <strong>view_reports</strong> pada event ini. Hubungi Admin untuk membuka akses laporan.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                  {[
                    { label: "Total Tiket Terjual", value: dashboard?.total_tickets ?? 0, color: "text-[#111d5e]", bg: "bg-blue-50/50" },
                    { label: "Penjualan Online", value: dashboard?.online_tickets ?? 0, color: "text-blue-600", bg: "bg-blue-50/50" },
                    { label: "Penjualan Offline OTS", value: dashboard?.offline_tickets ?? 0, color: "text-amber-600", bg: "bg-amber-50/50" },
                    { label: "Sudah Check-In", value: dashboard?.checked_in ?? 0, color: "text-emerald-600", bg: "bg-emerald-50/50" },
                    { label: "Belum Check-In", value: dashboard?.not_checked_in ?? 0, color: "text-rose-600", bg: "bg-rose-50/50" },
                    { label: "Sisa Kapasitas", value: dashboard?.remaining_tickets ?? 0, color: "text-gray-700", bg: "bg-gray-50" },
                  ].map((stat) => (
                    <div key={stat.label} className={`p-4 rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col items-center text-center`}>
                      <span className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</span>
                      <span className="text-[11px] text-gray-500 font-medium mt-1 leading-tight">{stat.label}</span>
                    </div>
                  ))}
                </div>

                {/* Progress Kehadiran */}
                <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700">Tingkat Kehadiran Pengunjung Venue:</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {dashboard && dashboard.total_tickets > 0
                        ? `${Math.round((dashboard.checked_in / dashboard.total_tickets) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          dashboard && dashboard.total_tickets > 0
                            ? Math.min(100, Math.round((dashboard.checked_in / dashboard.total_tickets) * 100))
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* 2. SCAN QR CHECK-IN TIKET (Permission: checkin)               */}
        {/* ============================================================== */}
        {tab === "checkin" && (
          <>
            {!canCheckin ? (
              <div className="p-8 rounded-2xl bg-white border border-gray-200 text-center space-y-3 max-w-xl mx-auto shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Akses Scan Check-in Dibatasi</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Akun Anda tidak memiliki izin <strong>checkin</strong> pada event ini. Hubungi Administrator untuk mengaktifkan izin scan tiket.
                </p>
              </div>
            ) : (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-6">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 mx-auto mb-2">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Validasi E-Ticket Pengunjung</h2>
                    <p className="text-xs text-gray-500">Pindai QR code tiket atau ketik kode tiket secara manual</p>
                  </div>

                  <form onSubmit={handleCheckin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Kode Tiket (Scan Barcode / Input Manual)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ticketCode}
                          onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                          placeholder="Contoh: TIX-2611-B57466"
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 focus:bg-white focus:border-[#111d5e] focus:outline-none uppercase"
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={checkinLoading || !ticketCode.trim()}
                          className="px-6 py-3 rounded-xl font-semibold text-sm bg-[#111d5e] text-white hover:bg-[#111d5e]/90 flex items-center gap-2 transition-all disabled:opacity-50 shrink-0 shadow-sm"
                        >
                          {checkinLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5" />
                          )}
                          Validasi
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Hasil Validasi Check-In */}
                  {checkinResult && (
                    <div
                      className={`p-5 rounded-2xl border flex items-start gap-4 ${
                        checkinResult.success
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : "bg-red-50 border-red-200 text-red-900"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          checkinResult.success ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {checkinResult.success ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className={`font-bold text-sm ${checkinResult.success ? "text-emerald-800" : "text-red-800"}`}>
                          {checkinResult.success ? "VALID: PENGUNJUNG DIIZINKAN MASUK" : "TIKET TIDAK VALID"}
                        </p>
                        <p className="text-xs text-gray-600">{checkinResult.message}</p>
                        {checkinResult.ticket && (
                          <div className="mt-2.5 pt-2 border-t border-gray-200/60 text-xs text-gray-600 space-y-0.5">
                            <p>Nama: <strong className="text-gray-900">{(checkinResult.ticket as any).owner_name || "-"}</strong></p>
                            <p>Kategori: <strong className="text-[#111d5e]">{(checkinResult.ticket as any).ticket_category || "-"}</strong></p>
                            <p>Event: <strong className="text-gray-900">{(checkinResult.ticket as any).event_name || "-"}</strong></p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Panduan Singkat */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 space-y-1">
                    <p className="font-semibold text-gray-700 mb-1">Ketentuan Scan Gerbang Masuk:</p>
                    <p>✓ 1 tiket hanya dapat di-checkin 1 kali (anti duplikasi tiket)</p>
                    <p>✓ Petugas hanya dapat memvalidasi tiket event yang ditugaskan</p>
                    <p>✗ Tiket dengan status sudah dipakai akan langsung ditolak</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* 3. RIWAYAT PENGUNJUNG CHECK-IN (Permission: view_visitors)     */}
        {/* ============================================================== */}
        {tab === "visitors" && (
          <>
            {!canViewVisitors ? (
              <div className="p-8 rounded-2xl bg-white border border-gray-200 text-center space-y-3 max-w-xl mx-auto shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Akses Riwayat Pengunjung Dibatasi</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Akun Anda tidak memiliki izin <strong>view_visitors</strong> pada event ini. Hubungi Administrator untuk mengaktifkan izin ini.
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Daftar Pengunjung Telah Check-In
                    </h3>
                    <p className="text-xs text-gray-500">Total {checkinHistory.length} pengunjung hadir di venue</p>
                  </div>
                  <button
                    onClick={() => fetchEventData(selectedEventId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Segarkan Data
                  </button>
                </div>

                {checkinHistory.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-10">Belum ada pengunjung yang melakukan check-in pada event ini.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50/50">
                          <th className="py-2.5 px-3">Kode Tiket</th>
                          <th className="py-2.5 px-3">Nama Pengunjung</th>
                          <th className="py-2.5 px-3">Kategori</th>
                          <th className="py-2.5 px-3">Waktu Masuk</th>
                          <th className="py-2.5 px-3 text-right">Petugas Validator</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {checkinHistory.map((v: any) => (
                          <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-3 font-mono text-[#111d5e] font-bold">{v.ticket_code}</td>
                            <td className="py-3 px-3 font-medium text-gray-900">{v.visitor_name || "Pengunjung"}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                {v.ticket_category || "General Pass"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-gray-500">
                              {v.checkin_time ? new Date(v.checkin_time).toLocaleString("id-ID") : "-"}
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
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* 4. PENJUALAN OFFLINE OTS (Permission: offline_sales)            */}
        {/* ============================================================== */}
        {tab === "offline" && (
          <>
            {!canOfflineSales ? (
              <div className="p-8 rounded-2xl bg-white border border-gray-200 text-center space-y-3 max-w-xl mx-auto shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Akses Penjualan Offline Dibatasi</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Akun Anda tidak memiliki izin <strong>offline_sales</strong> pada event ini. Hubungi Administrator untuk mengaktifkan izin penjualan tiket.
                </p>
              </div>
            ) : (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-6">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 mx-auto mb-2">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Penjualan Tiket Offline / Loket OTS</h2>
                    <p className="text-xs text-gray-500">Input transaksi pembelian tiket langsung di venue konser</p>
                  </div>

                  {offlineSuccess && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{offlineSuccess}</span>
                    </div>
                  )}

                  {offlineError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{offlineError}</span>
                      </div>
                      <button onClick={() => setOfflineError(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                  )}

                  <form onSubmit={handleOfflineSale} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Pembeli *</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={offlineForm.buyer_name}
                          onChange={(e) => setOfflineForm({ ...offlineForm, buyer_name: e.target.value })}
                          placeholder="Nama lengkap pembeli"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#111d5e]"
                        />
                        <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor WhatsApp / HP *</label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={offlineForm.phone}
                          onChange={(e) => setOfflineForm({ ...offlineForm, phone: e.target.value })}
                          placeholder="081234567890"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#111d5e]"
                        />
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Pembeli (Opsional)</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={offlineForm.buyer_email}
                          onChange={(e) => setOfflineForm({ ...offlineForm, buyer_email: e.target.value })}
                          placeholder="pembeli@email.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#111d5e]"
                        />
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Metode Pembayaran *</label>
                        <select
                          value={offlineForm.payment_method}
                          onChange={(e) =>
                            setOfflineForm({ ...offlineForm, payment_method: e.target.value as any })
                          }
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#111d5e]"
                        >
                          <option value="cash">Tunai (Cash Loket)</option>
                          <option value="qris">QRIS Statis Venue</option>
                          <option value="transfer">Transfer Bank</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kategori Tiket *</label>
                        <select
                          required
                          value={offlineForm.ticket_category_id}
                          onChange={(e) => setOfflineForm({ ...offlineForm, ticket_category_id: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#111d5e]"
                        >
                          <option value="">Pilih Kategori</option>
                          {ticketCategories.map((cat) => (
                            <option key={cat.id} value={cat.id} disabled={cat.stock <= 0}>
                              {cat.name} - {formatRupiah(cat.price)} (Sisa: {cat.stock})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jumlah Tiket</label>
                      <input
                        type="number"
                        min={1}
                        max={selectedCategory?.stock || 10}
                        value={offlineForm.quantity}
                        onChange={(e) =>
                          setOfflineForm({
                            ...offlineForm,
                            quantity: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#111d5e]"
                      />
                    </div>

                    {/* Ringkasan Biaya */}
                    {selectedCategory && (
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                        <div className="flex justify-between text-gray-500">
                          <span>Kategori Dipilih:</span>
                          <span className="text-gray-900 font-bold">{selectedCategory.name}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Harga Satuan:</span>
                          <span className="text-gray-900 font-bold">{formatRupiah(selectedCategory.price)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Jumlah Pembelian:</span>
                          <span className="text-gray-900 font-bold">{offlineForm.quantity} Tiket</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-gray-200 pt-2.5 mt-2">
                          <span className="font-bold text-gray-700">Total Pembayaran:</span>
                          <span className="font-bold text-[#111d5e] text-base">{formatRupiah(offlineTotal)}</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={offlineLoading || !selectedEventId || !offlineForm.ticket_category_id}
                      className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#111d5e] hover:bg-[#111d5e]/90 text-white shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {offlineLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Memproses Transaksi...
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          Proses Penjualan & Terbitkan E-Ticket OTS
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Riwayat Transaksi Offline Petugas */}
                {offlineSales.length > 0 && (
                  <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
                    <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-600" />
                      Riwayat Penjualan Offline Event Ini ({offlineSales.length} transaksi)
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {offlineSales.map((sale) => (
                        <div
                          key={sale.id}
                          className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-xs text-gray-900">{sale.buyer_name}</p>
                            <p className="text-[10px] text-gray-500">
                              {sale.phone} • Qty: {sale.quantity} • Met: {(sale.payment_method || "cash").toUpperCase()}
                            </p>
                          </div>
                          <span className="font-bold text-xs text-[#111d5e]">{formatRupiah(sale.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
