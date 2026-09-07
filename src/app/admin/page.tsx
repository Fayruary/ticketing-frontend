"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { getAdminDashboard, getEventStatistics, type AdminDashboard } from "@/services/dashboardService";
import { getEvents, createEvent, updateEvent, deleteEvent, publishEvent, type Event } from "@/services/eventService";
import { getBanners, createBanner, deleteBanner, type Banner } from "@/services/bannerService";
import { getPackages, createPackage, deletePackage, type CooperationPackage } from "@/services/packageService";
import { getOrganizers, type Organizer } from "@/services/organizerService";
import { getUsers, deleteUser } from "@/services/userService";
import { getStaff, assignStaff, removeStaff } from "@/services/staffService";
import { getAllOrders, type Order } from "@/services/orderService";
import { getTicketCategories, createTicketCategory, deleteTicketCategory, type TicketCategory } from "@/services/ticketService";
import { formatDate, formatRupiah, getStatusLabel } from "@/lib/utils";
import type { User as AuthUser } from "@/lib/auth";
import {
  LayoutDashboard, CalendarDays, Ticket, Users, ShieldCheck,
  Handshake, Package, FileBarChart2, ImageIcon, LogOut,
  Plus, Trash2, Edit3, Globe, EyeOff, ChevronRight,
  TrendingUp, DollarSign, Activity, AlertCircle, CheckCircle2,
  Menu, X, Sparkles
} from "lucide-react";

type AdminTab = "overview" | "events" | "banners" | "packages" | "users" | "staff" | "orders";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, role, loading: authLoading, logout } = useAuth();

  const [tab, setTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [packages, setPackages] = useState<CooperationPackage[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [selectedEventForTickets, setSelectedEventForTickets] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form States
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [eventForm, setEventForm] = useState<Partial<Event>>({});

  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState<Partial<TicketCategory>>({});

  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({});

  const [showPackageForm, setShowPackageForm] = useState(false);
  const [packageForm, setPackageForm] = useState<Partial<CooperationPackage>>({});

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== "admin")) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, role]);

  useEffect(() => {
    if (isAuthenticated && role === "admin") {
      fetchAll();
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (selectedEventForTickets) {
      fetchTicketCategories(selectedEventForTickets);
    }
  }, [selectedEventForTickets]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [dashRes, evtRes, banRes, pkgRes, orgRes, usrRes, ordRes] = await Promise.allSettled([
        getAdminDashboard(),
        getEvents(),
        getBanners(),
        getPackages(),
        getOrganizers(),
        getUsers(),
        getAllOrders(),
      ]);

      if (dashRes.status === "fulfilled") setDashboard(dashRes.value as any);
      if (evtRes.status === "fulfilled") setEvents(Array.isArray(evtRes.value) ? evtRes.value : []);
      if (banRes.status === "fulfilled") setBanners(Array.isArray(banRes.value) ? banRes.value : []);
      if (pkgRes.status === "fulfilled") setPackages(Array.isArray(pkgRes.value) ? pkgRes.value : []);
      if (orgRes.status === "fulfilled") setOrganizers(Array.isArray(orgRes.value) ? orgRes.value : []);
      if (usrRes.status === "fulfilled") setUsers(Array.isArray(usrRes.value) ? usrRes.value : []);
      if (ordRes.status === "fulfilled") setOrders(Array.isArray(ordRes.value) ? ordRes.value : []);
    } catch (err: any) {
      setError("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketCategories = async (eventId: string) => {
    try {
      const res: any = await getTicketCategories(eventId);
      setTicketCategories(Array.isArray(res) ? res : res?.data || []);
    } catch { setTicketCategories([]); }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // --- Event CRUD ---
  const handleSaveEvent = async () => {
    try {
      if (editingEvent?.id) {
        await updateEvent(editingEvent.id, eventForm);
        showSuccess("Event berhasil diperbarui!");
      } else {
        await createEvent(eventForm);
        showSuccess("Event berhasil ditambahkan!");
      }
      setShowEventForm(false);
      setEventForm({});
      setEditingEvent(null);
      fetchAll();
    } catch (err: any) { setError(err.message); }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Hapus event ini?")) return;
    try {
      await deleteEvent(id);
      showSuccess("Event berhasil dihapus!");
      fetchAll();
    } catch (err: any) { setError(err.message); }
  };

  const handlePublishEvent = async (id: string) => {
    try {
      await publishEvent(id);
      showSuccess("Event berhasil dipublish!");
      fetchAll();
    } catch (err: any) { setError(err.message); }
  };

  // --- Ticket Category CRUD ---
  const handleSaveTicketCategory = async () => {
    try {
      await createTicketCategory({ ...ticketForm, event_id: selectedEventForTickets });
      showSuccess("Kategori tiket berhasil ditambahkan!");
      setShowTicketForm(false);
      setTicketForm({});
      fetchTicketCategories(selectedEventForTickets);
    } catch (err: any) { setError(err.message); }
  };

  const handleDeleteTicketCategory = async (id: string) => {
    if (!confirm("Hapus kategori tiket ini?")) return;
    try {
      await deleteTicketCategory(id);
      showSuccess("Kategori tiket berhasil dihapus!");
      fetchTicketCategories(selectedEventForTickets);
    } catch (err: any) { setError(err.message); }
  };

  // --- Banner CRUD ---
  const handleSaveBanner = async () => {
    try {
      await createBanner(bannerForm);
      showSuccess("Banner berhasil ditambahkan!");
      setShowBannerForm(false);
      setBannerForm({});
      fetchAll();
    } catch (err: any) { setError(err.message); }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm("Hapus banner ini?")) return;
    try {
      await deleteBanner(id);
      showSuccess("Banner berhasil dihapus!");
      fetchAll();
    } catch (err: any) { setError(err.message); }
  };

  // --- Package CRUD ---
  const handleSavePackage = async () => {
    try {
      await createPackage(packageForm);
      showSuccess("Paket kerja sama berhasil ditambahkan!");
      setShowPackageForm(false);
      setPackageForm({});
      fetchAll();
    } catch (err: any) { setError(err.message); }
  };

  const handleDeletePackage = async (id: number) => {
    if (!confirm("Hapus paket ini?")) return;
    try {
      await deletePackage(id);
      showSuccess("Paket berhasil dihapus!");
      fetchAll();
    } catch (err: any) { setError(err.message); }
  };

  // --- User Delete ---
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Hapus user ini?")) return;
    try {
      await deleteUser(id);
      showSuccess("User berhasil dihapus!");
      fetchAll();
    } catch (err: any) { setError(err.message); }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Memuat Dashboard Admin...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || role !== "admin") return null;

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview & Statistik", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "events", label: "Manajemen Event", icon: <CalendarDays className="w-4 h-4" /> },
    { id: "banners", label: "Kelola Banner Promo", icon: <ImageIcon className="w-4 h-4" /> },
    { id: "packages", label: "Paket Kerja Sama EO", icon: <Package className="w-4 h-4" /> },
    { id: "users", label: "Manajemen Pengguna", icon: <Users className="w-4 h-4" /> },
    { id: "orders", label: "Laporan Penjualan", icon: <FileBarChart2 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col glass-panel border-r border-zinc-800/80 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
          <Link href="/" className="flex flex-col gap-2 group">
            <div className="bg-white px-3 py-1.5 rounded-xl inline-flex items-center shadow-sm">
              <img
                src="/logo-tix.png"
                alt="TixGoo Logo"
                className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex items-center gap-1.5 px-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Portal Admin</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-left transition-all ${
                tab === item.id
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
              }`}
            >
              {item.icon}
              {item.label}
              {tab === item.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-300 font-bold text-sm flex items-center justify-center shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || "AD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] font-bold text-amber-400 uppercase">Administrator</p>
            </div>
            <button onClick={() => { logout(); router.push("/"); }} className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 glass-panel border-b border-zinc-800/80 h-16 flex items-center gap-4 px-4 sm:px-6 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-lg text-white">
              {navItems.find(n => n.id === tab)?.label || "Dashboard Admin"}
            </h1>
          </div>

          {successMsg && (
            <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              {successMsg}
            </div>
          )}
          {error && (
            <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <AlertCircle className="w-4 h-4" />
              {error}
              <button onClick={() => setError(null)} className="ml-1">✕</button>
            </div>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {/* === OVERVIEW TAB === */}
          {tab === "overview" && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {[
                  { label: "Total Revenue", value: formatRupiah(dashboard?.total_revenue || 0), icon: <DollarSign className="w-6 h-6" />, color: "from-purple-600 to-pink-600", sub: "Total pendapatan platform" },
                  { label: "Tiket Terjual", value: `${dashboard?.total_tickets?.toLocaleString() || 0}`, icon: <Ticket className="w-6 h-6" />, color: "from-blue-600 to-cyan-600", sub: "Total e-ticket diterbitkan" },
                  { label: "Event Aktif", value: `${dashboard?.total_events || events.length}`, icon: <CalendarDays className="w-6 h-6" />, color: "from-amber-600 to-orange-600", sub: "Konser aktif di platform" },
                  { label: "Total Pengguna", value: `${dashboard?.total_users || users.length}`, icon: <Users className="w-6 h-6" />, color: "from-emerald-600 to-teal-600", sub: "Pengguna terdaftar" },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card p-5 rounded-3xl border border-zinc-800 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} p-3 flex items-center justify-center text-white shadow-lg`}>
                        {stat.icon}
                      </div>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                      <p className="text-xs font-bold text-zinc-300 mt-0.5">{stat.label}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{stat.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Orders Table */}
              <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Transaksi Terbaru
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400">
                        <th className="pb-3 text-left font-semibold">Invoice</th>
                        <th className="pb-3 text-left font-semibold">Pembeli</th>
                        <th className="pb-3 text-right font-semibold">Total</th>
                        <th className="pb-3 text-center font-semibold">Status</th>
                        <th className="pb-3 text-left font-semibold">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {orders.slice(0, 8).map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="py-3 font-mono text-purple-300">{order.invoice_code}</td>
                          <td className="py-3 text-zinc-200">{(order as any).buyer_name || "-"}</td>
                          <td className="py-3 text-right font-semibold text-white">{formatRupiah(order.total)}</td>
                          <td className="py-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              order.status === "paid" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" :
                              order.status === "pending" ? "bg-amber-500/10 text-amber-300 border border-amber-500/30" :
                              "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                            }`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="py-3 text-zinc-400">{formatDate(order.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* === EVENTS TAB === */}
          {tab === "events" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-sm text-zinc-400">{events.length} event terdaftar</div>
                <button
                  onClick={() => { setShowEventForm(true); setEditingEvent(null); setEventForm({}); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-500 transition-all"
                >
                  <Plus className="w-4 h-4" /> Tambah Event Baru
                </button>
              </div>

              {/* Event Form Modal */}
              {showEventForm && (
                <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4">
                  <h3 className="font-extrabold text-base text-white">{editingEvent?.id ? "Edit Event" : "Tambah Event Baru"}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "name", label: "Nama Event *", type: "text", required: true },
                      { key: "city", label: "Kota", type: "text" },
                      { key: "venue", label: "Venue / Lokasi", type: "text" },
                      { key: "capacity", label: "Kapasitas Venue", type: "number" },
                      { key: "event_date", label: "Tanggal Event", type: "date" },
                      { key: "event_time", label: "Waktu Event", type: "time" },
                      { key: "genre", label: "Genre Musik", type: "text" },
                      { key: "poster", label: "URL Poster Event", type: "url" },
                    ].map(({ key, label, type, required }) => (
                      <div key={key}>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">{label}</label>
                        <input
                          type={type}
                          required={required}
                          value={(eventForm as any)[key] || ""}
                          onChange={(e) => setEventForm({ ...eventForm, [key]: e.target.value })}
                          className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Organizer ID</label>
                      <select
                        value={(eventForm as any).organizer_id || ""}
                        onChange={(e) => setEventForm({ ...eventForm, organizer_id: e.target.value })}
                        className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">Pilih Organizer (Opsional)</option>
                        {organizers.map((o) => (
                          <option key={o.id} value={o.id}>{o.name} - {o.company_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Deskripsi Event</label>
                      <textarea
                        rows={3}
                        value={(eventForm as any).description || ""}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSaveEvent} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-500 transition-all">
                      {editingEvent?.id ? "Update Event" : "Simpan Event"}
                    </button>
                    <button onClick={() => { setShowEventForm(false); setEventForm({}); }} className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Events Table */}
              <div className="glass-panel rounded-3xl border border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60">
                        <th className="px-4 py-3 text-left font-semibold text-zinc-400">Nama Event</th>
                        <th className="px-4 py-3 text-left font-semibold text-zinc-400">Kota</th>
                        <th className="px-4 py-3 text-left font-semibold text-zinc-400">Tanggal</th>
                        <th className="px-4 py-3 text-center font-semibold text-zinc-400">Status</th>
                        <th className="px-4 py-3 text-center font-semibold text-zinc-400">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {events.map((event) => (
                        <tr key={event.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white">{event.name}</td>
                          <td className="px-4 py-3 text-zinc-300">{event.city || "-"}</td>
                          <td className="px-4 py-3 text-zinc-300">{formatDate(event.event_date)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              event.status === "published" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" :
                              event.status === "draft" ? "bg-zinc-700/60 text-zinc-300 border border-zinc-700" :
                              "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                            }`}>
                              {getStatusLabel(event.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              {event.status === "draft" && (
                                <button
                                  onClick={() => handlePublishEvent(event.id)}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                                >
                                  <Globe className="w-3 h-3" /> Publish
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingEvent(event);
                                  setEventForm(event);
                                  setShowEventForm(true);
                                }}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              {/* Ticket Category quick selector */}
                              <button
                                onClick={() => setSelectedEventForTickets(event.id)}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all flex items-center gap-1"
                              >
                                <Ticket className="w-3 h-3" /> Kategori
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ticket Categories Sub-panel */}
              {selectedEventForTickets && (
                <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-purple-400" />
                      Kategori Tiket: <span className="text-purple-300">{events.find(e => e.id === selectedEventForTickets)?.name}</span>
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowTicketForm(!showTicketForm)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Kategori
                      </button>
                      <button
                        onClick={() => setSelectedEventForTickets("")}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>

                  {showTicketForm && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800">
                      {[
                        { key: "name", label: "Nama Kategori (VIP, Regular, dll)", type: "text" },
                        { key: "price", label: "Harga (Rp)", type: "number" },
                        { key: "stock", label: "Stok Tiket", type: "number" },
                      ].map(({ key, label, type }) => (
                        <div key={key}>
                          <label className="block text-xs font-bold text-zinc-300 mb-1">{label}</label>
                          <input
                            type={type}
                            value={(ticketForm as any)[key] || ""}
                            onChange={(e) => setTicketForm({ ...ticketForm, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
                            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      ))}
                      <div className="sm:col-span-3 flex gap-3">
                        <button onClick={handleSaveTicketCategory} className="px-5 py-2 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-500">Simpan</button>
                        <button onClick={() => setShowTicketForm(false)} className="px-4 py-2 rounded-xl text-sm bg-zinc-800 text-zinc-300">Batal</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {ticketCategories.length === 0 ? (
                      <p className="text-xs text-zinc-400 text-center py-4">Belum ada kategori tiket untuk event ini.</p>
                    ) : (
                      ticketCategories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                          <div>
                            <span className="font-bold text-sm text-white">{cat.name}</span>
                            <span className="ml-3 text-xs text-zinc-400">Harga: {formatRupiah(cat.price)}</span>
                            <span className="ml-3 text-xs text-zinc-400">Stok: {cat.stock}</span>
                          </div>
                          <button onClick={() => handleDeleteTicketCategory(cat.id)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === BANNERS TAB === */}
          {tab === "banners" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowBannerForm(!showBannerForm)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-500 transition-all"
                >
                  <Plus className="w-4 h-4" /> Tambah Banner Promo
                </button>
              </div>

              {showBannerForm && (
                <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4">
                  <h3 className="font-extrabold text-base text-white">Tambah Banner Baru</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Judul Banner</label>
                      <input
                        type="text"
                        value={bannerForm.title || ""}
                        onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                        className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">URL Gambar Banner</label>
                      <input
                        type="url"
                        value={(bannerForm as any).image || ""}
                        onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                        className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSaveBanner} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-500">Simpan</button>
                    <button onClick={() => setShowBannerForm(false)} className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-zinc-800 text-zinc-300">Batal</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {banners.map((banner) => (
                  <div key={banner.id} className="glass-card rounded-3xl border border-zinc-800 overflow-hidden">
                    <div className="h-32 bg-zinc-900 overflow-hidden">
                      {(banner.image || banner.image_url) && (
                        <img
                          src={banner.image || banner.image_url}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-white">{banner.title}</p>
                        <span className={`text-[10px] font-bold ${banner.is_active ? "text-emerald-400" : "text-zinc-500"}`}>
                          {banner.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                      <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === PACKAGES TAB === */}
          {tab === "packages" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowPackageForm(!showPackageForm)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-500 transition-all"
                >
                  <Plus className="w-4 h-4" /> Tambah Paket Kerja Sama
                </button>
              </div>

              {showPackageForm && (
                <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4">
                  <h3 className="font-extrabold text-base text-white">Tambah Paket Baru</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "name", label: "Nama Paket", type: "text" },
                      { key: "duration", label: "Durasi (contoh: 1 Bulan)", type: "text" },
                      { key: "price", label: "Harga Paket (Rp)", type: "number" },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">{label}</label>
                        <input
                          type={type}
                          value={(packageForm as any)[key] || ""}
                          onChange={(e) => setPackageForm({ ...packageForm, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
                          className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Deskripsi Paket</label>
                      <textarea
                        rows={2}
                        value={packageForm.description || ""}
                        onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                        className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSavePackage} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-500">Simpan</button>
                    <button onClick={() => setShowPackageForm(false)} className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-zinc-800 text-zinc-300">Batal</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="glass-card p-5 rounded-3xl border border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-base text-white">{pkg.name}</h4>
                        <span className="text-xs text-purple-300">{pkg.duration}</span>
                      </div>
                      <button onClick={() => handleDeletePackage(pkg.id)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xl font-extrabold text-gradient">{formatRupiah(pkg.price)}</p>
                    <p className="text-xs text-zinc-400">{pkg.description || "-"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === USERS TAB === */}
          {tab === "users" && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">{users.length} pengguna terdaftar</p>
              <div className="glass-panel rounded-3xl border border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60">
                        <th className="px-4 py-3 text-left font-semibold text-zinc-400">Nama</th>
                        <th className="px-4 py-3 text-left font-semibold text-zinc-400">Email</th>
                        <th className="px-4 py-3 text-left font-semibold text-zinc-400">Telepon</th>
                        <th className="px-4 py-3 text-center font-semibold text-zinc-400">Role</th>
                        <th className="px-4 py-3 text-center font-semibold text-zinc-400">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white">{u.name}</td>
                          <td className="px-4 py-3 text-zinc-300">{u.email}</td>
                          <td className="px-4 py-3 text-zinc-300">{u.phone || "-"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              u.role === "admin" ? "bg-amber-500/10 text-amber-300 border border-amber-500/30" :
                              u.role === "petugas" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" :
                              "bg-blue-500/10 text-blue-300 border border-blue-500/30"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {u.role !== "admin" && (
                              <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* === ORDERS / LAPORAN TAB === */}
          {tab === "orders" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: "Total Order", value: orders.length, color: "text-white" },
                  { label: "Order Berhasil (Paid)", value: orders.filter(o => o.status === "paid").length, color: "text-emerald-400" },
                  { label: "Order Pending", value: orders.filter(o => o.status === "pending").length, color: "text-amber-400" },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card p-5 rounded-3xl border border-zinc-800">
                    <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-zinc-400 mt-1 font-semibold">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="glass-panel rounded-3xl border border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60">
                        <th className="px-4 py-3 text-left font-semibold text-zinc-400">Invoice</th>
                        <th className="px-4 py-3 text-left font-semibold text-zinc-400">Pembeli</th>
                        <th className="px-4 py-3 text-right font-semibold text-zinc-400">Total</th>
                        <th className="px-4 py-3 text-center font-semibold text-zinc-400">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-zinc-400">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="px-4 py-3 font-mono text-purple-300">{order.invoice_code}</td>
                          <td className="px-4 py-3 text-zinc-200">{(order as any).buyer_name || "-"}</td>
                          <td className="px-4 py-3 text-right font-semibold text-white">{formatRupiah(order.total)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              order.status === "paid" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" :
                              order.status === "pending" ? "bg-amber-500/10 text-amber-300 border border-amber-500/30" :
                              "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                            }`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-400">{formatDate(order.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
