"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { getPetugasDashboard, type PetugasDashboard } from "@/services/dashboardService";
import { getEvents, type Event } from "@/services/eventService";
import { getTicketCategories, type TicketCategory } from "@/services/ticketService";
import { checkinTicket, getEventCheckins, type CheckinResponse } from "@/services/checkinService";
import { createOfflineSale, getEventOfflineSales, type OfflineSale } from "@/services/offlineSaleService";
import { formatDate, formatRupiah } from "@/lib/utils";
import {
  Ticket, ScanLine, QrCode, ShieldCheck, CheckCircle2, AlertCircle, XCircle,
  Users, LogOut, Activity, BarChart3, ShoppingBag, User, Phone, Mail,
  ChevronDown, Sparkles, Menu, X, Clock, Wifi
} from "lucide-react";

type PetugasTab = "dashboard" | "checkin" | "offline";

export default function PetugasPage() {
  const router = useRouter();
  const { user, isAuthenticated, role, loading: authLoading, logout } = useAuth();

  const [tab, setTab] = useState<PetugasTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [dashboard, setDashboard] = useState<PetugasDashboard | null>(null);
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [checkinHistory, setCheckinHistory] = useState<any[]>([]);
  const [offlineSales, setOfflineSales] = useState<OfflineSale[]>([]);

  const [loading, setLoading] = useState(true);

  // Check-in state
  const [ticketCode, setTicketCode] = useState("");
  const [checkinResult, setCheckinResult] = useState<CheckinResponse | null>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);

  // Offline sale form
  const [offlineForm, setOfflineForm] = useState({
    buyer_name: "",
    phone: "",
    email: "",
    ticket_category_id: "",
    quantity: 1,
  });
  const [offlineLoading, setOfflineLoading] = useState(false);
  const [offlineSuccess, setOfflineSuccess] = useState<string | null>(null);
  const [offlineError, setOfflineError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== "petugas")) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, role]);

  useEffect(() => {
    if (isAuthenticated && role === "petugas") {
      fetchInitialData();
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventData(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [dashRes, evtRes] = await Promise.allSettled([
        getPetugasDashboard(),
        getEvents(),
      ]);

      if (dashRes.status === "fulfilled") setDashboard(dashRes.value as any);
      if (evtRes.status === "fulfilled") {
        const evts = Array.isArray(evtRes.value) ? evtRes.value : [];
        setMyEvents(evts);
        if (evts.length > 0 && !selectedEventId) {
          setSelectedEventId(evts[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading petugas data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventData = async (eventId: string) => {
    try {
      const [catRes, checkinRes, salesRes] = await Promise.allSettled([
        getTicketCategories(eventId),
        getEventCheckins(eventId),
        getEventOfflineSales(eventId),
      ]);

      if (catRes.status === "fulfilled") {
        setTicketCategories(Array.isArray(catRes.value) ? catRes.value : []);
      }
      if (checkinRes.status === "fulfilled") {
        setCheckinHistory(Array.isArray(checkinRes.value) ? checkinRes.value : []);
      }
      if (salesRes.status === "fulfilled") {
        setOfflineSales(Array.isArray(salesRes.value) ? salesRes.value : []);
      }
    } catch (err) {
      console.error("Error loading event data:", err);
    }
  };

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;
    try {
      setCheckinLoading(true);
      setCheckinResult(null);
      const result = await checkinTicket(ticketCode.trim());
      setCheckinResult(result as any);
      if ((result as any).success) {
        fetchEventData(selectedEventId);
      }
      setTicketCode("");
    } catch (err: any) {
      setCheckinResult({ success: false, message: err.message || "Tiket tidak valid atau tidak ditemukan" });
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleOfflineSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;
    try {
      setOfflineLoading(true);
      setOfflineError(null);
      setOfflineSuccess(null);

      await createOfflineSale({
        event_id: selectedEventId,
        buyer_name: offlineForm.buyer_name,
        phone: offlineForm.phone,
        ticket_category_id: offlineForm.ticket_category_id,
        quantity: offlineForm.quantity,
      });

      setOfflineSuccess("Penjualan tiket offline berhasil! E-Ticket telah diterbitkan.");
      setOfflineForm({ buyer_name: "", phone: "", email: "", ticket_category_id: "", quantity: 1 });
      fetchEventData(selectedEventId);
    } catch (err: any) {
      setOfflineError(err.message || "Gagal memproses penjualan offline");
    } finally {
      setOfflineLoading(false);
    }
  };

  const selectedEvent = myEvents.find(e => e.id === selectedEventId);
  const selectedCategory = ticketCategories.find(c => c.id === offlineForm.ticket_category_id);
  const offlineTotal = selectedCategory ? Number(selectedCategory.price) * offlineForm.quantity : 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Memuat Portal Petugas Event...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || role !== "petugas") return null;

  const tabs: { id: PetugasTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "checkin", label: "Scan QR Check-in", icon: <ScanLine className="w-4 h-4" /> },
    { id: "offline", label: "Penjualan Offline OTS", icon: <ShoppingBag className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center group">
              <div className="bg-white px-3 py-1.5 rounded-xl inline-flex items-center shadow-sm">
                <img
                  src="/logo-tix.png"
                  alt="TixGoo Logo"
                  className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </div>
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Petugas Event</span>
            </div>
          </div>

          {/* Event Selector */}
          {myEvents.length > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-semibold">Event Aktif:</span>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
              >
                {myEvents.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-white">{user?.name}</span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Petugas Lapangan</span>
            </div>
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 border-t border-zinc-800/80">
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-hide">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                  tab === t.id
                    ? "border-emerald-500 text-emerald-300 bg-emerald-500/5"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Event Info Banner */}
        {selectedEvent && (
          <div className="glass-panel px-5 py-3.5 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold uppercase">Event Aktif</span>
            </div>
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <strong className="text-white font-extrabold">{selectedEvent.name}</strong>
              <span className="text-zinc-400 text-xs">{formatDate(selectedEvent.event_date)}</span>
              <span className="text-zinc-400 text-xs">{selectedEvent.venue}</span>
            </div>
            {/* Mobile event switcher */}
            {myEvents.length > 1 && (
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="sm:hidden ml-auto px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
              >
                {myEvents.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* === DASHBOARD TAB === */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Total Tiket", value: dashboard?.total_tickets ?? checkinHistory.length + offlineSales.length, color: "text-purple-300", bg: "bg-purple-500/10 border-purple-500/20" },
                { label: "Online", value: dashboard?.online_tickets ?? checkinHistory.length, color: "text-blue-300", bg: "bg-blue-500/10 border-blue-500/20" },
                { label: "Offline OTS", value: dashboard?.offline_tickets ?? offlineSales.length, color: "text-amber-300", bg: "bg-amber-500/10 border-amber-500/20" },
                { label: "Sudah Check-in", value: dashboard?.checked_in ?? checkinHistory.length, color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { label: "Belum Check-in", value: dashboard?.not_checked_in ?? 0, color: "text-rose-300", bg: "bg-rose-500/10 border-rose-500/20" },
                { label: "Sisa Kapasitas", value: dashboard?.remaining_tickets ?? (selectedEvent?.capacity ? selectedEvent.capacity - checkinHistory.length : "?"), color: "text-zinc-300", bg: "bg-zinc-800/60 border-zinc-700/60" },
              ].map((stat) => (
                <div key={stat.label} className={`p-4 rounded-2xl border ${stat.bg} flex flex-col items-center text-center`}>
                  <span className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</span>
                  <span className="text-[10px] text-zinc-400 font-semibold mt-1 leading-tight">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Check-in Log */}
            <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Log Check-in Pengunjung
              </h3>

              {checkinHistory.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-6">Belum ada check-in. Mulai scan tiket pengunjung.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400">
                        <th className="pb-3 text-left font-semibold">Kode Tiket</th>
                        <th className="pb-3 text-left font-semibold">Waktu Check-in</th>
                        <th className="pb-3 text-center font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {checkinHistory.slice(0, 15).map((c: any) => (
                        <tr key={c.id} className="hover:bg-zinc-900/40">
                          <td className="py-2.5 font-mono text-purple-300">{c.ticket_code || c.ticket_id}</td>
                          <td className="py-2.5 text-zinc-300">{c.checkin_time ? new Date(c.checkin_time).toLocaleString("id-ID") : "-"}</td>
                          <td className="py-2.5 text-center">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                              Check-in Berhasil
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === CHECK-IN SCAN TAB === */}
        {tab === "checkin" && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 space-y-6">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto mb-2">
                  <QrCode className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-extrabold text-white">Validasi Tiket Pengunjung</h2>
                <p className="text-xs text-zinc-400">Input kode tiket dari QR scan atau ketik manual</p>
              </div>

              <form onSubmit={handleCheckin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-2">Kode Tiket (Scan QR atau Input Manual)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ticketCode}
                      onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                      placeholder="TKT-XXXXXXXXXXXXX"
                      className="flex-1 px-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 uppercase"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={checkinLoading || !ticketCode.trim()}
                      className="px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
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

              {/* Result */}
              {checkinResult && (
                <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
                  checkinResult.success
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-rose-500/10 border-rose-500/30"
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    checkinResult.success ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                  }`}>
                    {checkinResult.success
                      ? <CheckCircle2 className="w-6 h-6" />
                      : <XCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className={`font-extrabold text-sm ${checkinResult.success ? "text-emerald-300" : "text-rose-300"}`}>
                      {checkinResult.success ? "✅ CHECK-IN BERHASIL!" : "❌ TIKET TIDAK VALID"}
                    </p>
                    <p className="text-xs text-zinc-300 mt-1">{checkinResult.message}</p>
                    {checkinResult.ticket && (
                      <div className="mt-3 space-y-1 text-xs text-zinc-400">
                        <p>Event: <strong className="text-white">{checkinResult.ticket.event_name}</strong></p>
                        <p>Kategori: <strong className="text-purple-300">{checkinResult.ticket.ticket_category}</strong></p>
                        <p>Venue: <strong className="text-white">{checkinResult.ticket.venue}</strong></p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                <p className="font-bold text-zinc-300 mb-1">Panduan Validasi Tiket:</p>
                <p>✓ Scan QR Code pada E-Ticket pengunjung</p>
                <p>✓ Atau ketik kode tiket manual (format: TKT-...)</p>
                <p>✗ Tiket yang sudah terpakai tidak dapat digunakan lagi</p>
                <p>✗ Tiket dengan pembayaran pending tidak valid masuk</p>
              </div>
            </div>

            {/* Recent check-ins mini log */}
            {checkinHistory.length > 0 && (
              <div className="glass-panel p-5 rounded-3xl border border-zinc-800 space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Check-in Terbaru ({checkinHistory.length} pengunjung)
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {checkinHistory.slice(0, 10).reverse().map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800/60">
                      <span className="font-mono text-xs text-purple-300">{c.ticket_code || c.ticket_id}</span>
                      <span className="text-[10px] text-zinc-400">{c.checkin_time ? new Date(c.checkin_time).toLocaleTimeString("id-ID") : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === OFFLINE SALE TAB === */}
        {tab === "offline" && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 space-y-6">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto mb-2">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-extrabold text-white">Penjualan Tiket Offline / OTS</h2>
                <p className="text-xs text-zinc-400">Input data pembeli yang beli tiket langsung di venue saat hari H</p>
              </div>

              {offlineSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {offlineSuccess}
                </div>
              )}

              {offlineError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {offlineError}
                  <button onClick={() => setOfflineError(null)} className="ml-auto text-xs">✕</button>
                </div>
              )}

              <form onSubmit={handleOfflineSale} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Nama Pembeli *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={offlineForm.buyer_name}
                      onChange={(e) => setOfflineForm({ ...offlineForm, buyer_name: e.target.value })}
                      placeholder="Nama lengkap pembeli"
                      className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Nomor HP *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={offlineForm.phone}
                      onChange={(e) => setOfflineForm({ ...offlineForm, phone: e.target.value })}
                      placeholder="08xxxxxxxxx"
                      className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Kategori Tiket *</label>
                  <select
                    required
                    value={offlineForm.ticket_category_id}
                    onChange={(e) => setOfflineForm({ ...offlineForm, ticket_category_id: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Pilih Kategori Tiket</option>
                    {ticketCategories.map((cat) => (
                      <option key={cat.id} value={cat.id} disabled={cat.stock <= 0}>
                        {cat.name} - {formatRupiah(cat.price)} (Stok: {cat.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Jumlah Tiket</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedCategory?.stock || 10}
                    value={offlineForm.quantity}
                    onChange={(e) => setOfflineForm({ ...offlineForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Summary */}
                {selectedCategory && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Harga Satuan:</span>
                      <span className="text-white font-bold">{formatRupiah(selectedCategory.price)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Jumlah:</span>
                      <span className="text-white font-bold">{offlineForm.quantity} Tiket</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-zinc-800 pt-2 mt-2">
                      <span className="font-bold text-zinc-200">Total Pembayaran:</span>
                      <span className="font-extrabold text-amber-300 text-base">{formatRupiah(offlineTotal)}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={offlineLoading || !selectedEventId || !offlineForm.ticket_category_id}
                  className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {offlineLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Proses Penjualan & Terbitkan E-Ticket
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Offline Sales History */}
            {offlineSales.length > 0 && (
              <div className="glass-panel p-5 rounded-3xl border border-zinc-800 space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Riwayat Penjualan Offline ({offlineSales.length} transaksi)
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {offlineSales.map((sale) => (
                    <div key={sale.id} className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/60 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs text-white">{sale.buyer_name}</p>
                        <p className="text-[10px] text-zinc-400">{sale.phone} • Qty: {sale.quantity}</p>
                      </div>
                      <span className="font-bold text-xs text-amber-300">{formatRupiah(sale.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
