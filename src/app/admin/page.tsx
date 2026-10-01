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

/* ---------- Shared UI tokens (selaras dengan halaman user) ---------- */
const UI = {
  card: "bg-white rounded-2xl border border-gray-100 shadow-sm",
  input:
    "w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#111d5e] focus:border-transparent transition-all",
  label: "block text-xs font-bold text-gray-700 mb-1.5",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#111d5e] hover:bg-[#0c1543] active:scale-95 transition-all shadow-sm",
  btnPrimarySm:
    "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#111d5e] hover:bg-[#0c1543] active:scale-95 transition-all shadow-sm",
  btnSecondary:
    "inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all",
  btnSecondarySm:
    "inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all",
  iconBtnDanger: "p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors",
  iconBtnNeutral: "p-2 rounded-lg text-gray-400 hover:text-[#111d5e] hover:bg-blue-50 transition-colors",
  th: "px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide",
  badgeBase: "inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
  badgeGreen: "bg-emerald-50 text-emerald-700 border-emerald-100",
  badgeAmber: "bg-amber-50 text-amber-700 border-amber-100",
  badgeRed: "bg-red-50 text-red-600 border-red-100",
  badgeBlue: "bg-blue-50 text-blue-700 border-blue-100",
  badgeGray: "bg-gray-100 text-gray-600 border-gray-200",
};

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#111d5e] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">Memuat Dashboard Admin...</p>
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

  const orderStatusBadge = (status: string) =>
    status === "paid" ? UI.badgeGreen : status === "pending" ? UI.badgeAmber : UI.badgeRed;

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col bg-white border-r border-gray-100 shadow-sm transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Sidebar Header */}
        <div className="h-16 sm:h-20 px-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo-tix.png"
              alt="TixGoo Logo"
              className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#111d5e] text-[10px] font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              Admin
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menu</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors ${
                tab === item.id
                  ? "bg-[#111d5e] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#111d5e]"
              }`}
            >
              {item.icon}
              {item.label}
              {tab === item.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-9 h-9 rounded-full bg-[#111d5e] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || "AD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 font-medium">Administrator</p>
            </div>
            <button onClick={() => { logout(); router.push("/"); }} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 min-h-screen flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm h-16 sm:h-20 flex items-center gap-4 px-4 sm:px-8 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-black text-lg sm:text-2xl text-gray-900 tracking-tight">
              {navItems.find(n => n.id === tab)?.label || "Dashboard Admin"}
            </h1>
          </div>

          {successMsg && (
            <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              {successMsg}
            </div>
          )}
          {error && (
            <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold">
              <AlertCircle className="w-4 h-4" />
              {error}
              <button onClick={() => setError(null)} className="ml-1 hover:text-red-800">✕</button>
            </div>
          )}
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8 overflow-auto">
          {/* === OVERVIEW TAB === */}
          {tab === "overview" && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {[
                  { label: "Total Revenue", value: formatRupiah(dashboard?.total_revenue || 0), icon: <DollarSign className="w-5 h-5" />, color: "bg-blue-50 text-[#111d5e]", sub: "Total pendapatan platform" },
                  { label: "Tiket Terjual", value: `${dashboard?.total_tickets?.toLocaleString() || 0}`, icon: <Ticket className="w-5 h-5" />, color: "bg-emerald-50 text-emerald-600", sub: "Total e-ticket diterbitkan" },
                  { label: "Event Aktif", value: `${dashboard?.total_events || events.length}`, icon: <CalendarDays className="w-5 h-5" />, color: "bg-amber-50 text-amber-600", sub: "Konser aktif di platform" },
                  { label: "Total Pengguna", value: `${dashboard?.total_users || users.length}`, icon: <Users className="w-5 h-5" />, color: "bg-purple-50 text-purple-600", sub: "Pengguna terdaftar" },
                ].map((stat) => (
                  <div key={stat.label} className={`${UI.card} p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow`}>
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center`}>
                        {stat.icon}
                      </div>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                      <p className="text-xs font-bold text-gray-700 mt-0.5">{stat.label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{stat.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Orders Table */}
              <div className={`${UI.card} p-6 space-y-4`}>
                <h3 className="font-black text-lg text-gray-900 flex items-center gap-2 tracking-tight">
                  <Activity className="w-5 h-5 text-[#111d5e]" />
                  Transaksi Terbaru
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className={`${UI.th} rounded-l-lg`}>Invoice</th>
                        <th className={UI.th}>Pembeli</th>
                        <th className={`${UI.th} text-right`}>Total</th>
                        <th className={`${UI.th} text-center`}>Status</th>
                        <th className={`${UI.th} rounded-r-lg`}>Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.slice(0, 8).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-semibold text-[#111d5e]">{order.invoice_code}</td>
                          <td className="px-4 py-3.5 text-gray-700">{(order as any).buyer_name || "-"}</td>
                          <td className="px-4 py-3.5 text-right font-bold text-gray-900">{formatRupiah(order.total)}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`${UI.badgeBase} ${orderStatusBadge(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-500">{formatDate(order.created_at)}</td>
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
                <div className="text-sm font-medium text-gray-500">{events.length} event terdaftar</div>
                <button
                  onClick={() => { setShowEventForm(true); setEditingEvent(null); setEventForm({}); }}
                  className={UI.btnPrimary}
                >
                  <Plus className="w-4 h-4" /> Tambah Event Baru
                </button>
              </div>

              {/* Event Form Modal */}
              {showEventForm && (
                <div className={`${UI.card} p-6 space-y-5`}>
                  <h3 className="font-black text-lg text-gray-900 tracking-tight">{editingEvent?.id ? "Edit Event" : "Tambah Event Baru"}</h3>
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
                        <label className={UI.label}>{label}</label>
                        <input
                          type={type}
                          required={required}
                          value={(eventForm as any)[key] || ""}
                          onChange={(e) => setEventForm({ ...eventForm, [key]: e.target.value })}
                          className={UI.input}
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className={UI.label}>Organizer ID</label>
                      <select
                        value={(eventForm as any).organizer_id || ""}
                        onChange={(e) => setEventForm({ ...eventForm, organizer_id: e.target.value })}
                        className={UI.input}
                      >
                        <option value="">Pilih Organizer (Opsional)</option>
                        {organizers.map((o) => (
                          <option key={o.id} value={o.id}>{o.name} - {o.company_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={UI.label}>Deskripsi Event</label>
                      <textarea
                        rows={3}
                        value={(eventForm as any).description || ""}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        className={`${UI.input} resize-none`}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSaveEvent} className={UI.btnPrimary}>
                      {editingEvent?.id ? "Update Event" : "Simpan Event"}
                    </button>
                    <button onClick={() => { setShowEventForm(false); setEventForm({}); }} className={UI.btnSecondary}>
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Events Table */}
              <div className={`${UI.card} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className={UI.th}>Nama Event</th>
                        <th className={UI.th}>Kota</th>
                        <th className={UI.th}>Tanggal</th>
                        <th className={`${UI.th} text-center`}>Status</th>
                        <th className={`${UI.th} text-center`}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-gray-900">{event.name}</td>
                          <td className="px-4 py-3.5 text-gray-600">{event.city || "-"}</td>
                          <td className="px-4 py-3.5 text-gray-600">{formatDate(event.event_date)}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`${UI.badgeBase} ${
                              event.status === "published" ? UI.badgeGreen :
                              event.status === "draft" ? UI.badgeGray :
                              UI.badgeAmber
                            }`}>
                              {getStatusLabel(event.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {event.status === "draft" && (
                                <button
                                  onClick={() => handlePublishEvent(event.id)}
                                  className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-1"
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
                                className={UI.iconBtnNeutral}
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className={UI.iconBtnDanger}
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              {/* Ticket Category quick selector */}
                              <button
                                onClick={() => setSelectedEventForTickets(event.id)}
                                className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#111d5e] border border-blue-100 hover:bg-blue-100 transition-colors flex items-center gap-1"
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
                <div className={`${UI.card} p-6 space-y-4`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="font-black text-base text-gray-900 flex items-center gap-2 tracking-tight">
                      <Ticket className="w-4 h-4 text-[#111d5e]" />
                      Kategori Tiket: <span className="text-[#111d5e]">{events.find(e => e.id === selectedEventForTickets)?.name}</span>
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowTicketForm(!showTicketForm)}
                        className={UI.btnPrimarySm}
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Kategori
                      </button>
                      <button
                        onClick={() => setSelectedEventForTickets("")}
                        className={UI.btnSecondarySm}
                      >
                        Tutup
                      </button>
                    </div>
                  </div>

                  {showTicketForm && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      {[
                        { key: "name", label: "Nama Kategori (VIP, Regular, dll)", type: "text" },
                        { key: "price", label: "Harga (Rp)", type: "number" },
                        { key: "stock", label: "Stok Tiket", type: "number" },
                      ].map(({ key, label, type }) => (
                        <div key={key}>
                          <label className={UI.label}>{label}</label>
                          <input
                            type={type}
                            value={(ticketForm as any)[key] || ""}
                            onChange={(e) => setTicketForm({ ...ticketForm, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
                            className={UI.input}
                          />
                        </div>
                      ))}
                      <div className="sm:col-span-3 flex gap-3">
                        <button onClick={handleSaveTicketCategory} className={UI.btnPrimarySm}>Simpan</button>
                        <button onClick={() => setShowTicketForm(false)} className={UI.btnSecondarySm}>Batal</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {ticketCategories.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">Belum ada kategori tiket untuk event ini.</p>
                    ) : (
                      ticketCategories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="font-bold text-sm text-gray-900">{cat.name}</span>
                            <span className="text-xs text-gray-500">Harga: <span className="font-semibold text-[#111d5e]">{formatRupiah(cat.price)}</span></span>
                            <span className="text-xs text-gray-500">Stok: <span className="font-semibold text-gray-700">{cat.stock}</span></span>
                          </div>
                          <button onClick={() => handleDeleteTicketCategory(cat.id)} className={UI.iconBtnDanger}>
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
                  className={UI.btnPrimary}
                >
                  <Plus className="w-4 h-4" /> Tambah Banner Promo
                </button>
              </div>

              {showBannerForm && (
                <div className={`${UI.card} p-6 space-y-5`}>
                  <h3 className="font-black text-lg text-gray-900 tracking-tight">Tambah Banner Baru</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={UI.label}>Judul Banner</label>
                      <input
                        type="text"
                        value={bannerForm.title || ""}
                        onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                        className={UI.input}
                      />
                    </div>
                    <div>
                      <label className={UI.label}>URL Gambar Banner</label>
                      <input
                        type="url"
                        value={(bannerForm as any).image || ""}
                        onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                        className={UI.input}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSaveBanner} className={UI.btnPrimary}>Simpan</button>
                    <button onClick={() => setShowBannerForm(false)} className={UI.btnSecondary}>Batal</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {banners.map((banner) => (
                  <div key={banner.id} className={`${UI.card} overflow-hidden hover:shadow-md transition-shadow`}>
                    <div className="h-36 bg-gray-100 overflow-hidden">
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
                        <p className="font-bold text-sm text-gray-900">{banner.title}</p>
                        <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold ${banner.is_active ? "text-emerald-600" : "text-gray-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${banner.is_active ? "bg-emerald-500" : "bg-gray-300"}`} />
                          {banner.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                      <button onClick={() => handleDeleteBanner(banner.id)} className={UI.iconBtnDanger}>
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
                  className={UI.btnPrimary}
                >
                  <Plus className="w-4 h-4" /> Tambah Paket Kerja Sama
                </button>
              </div>

              {showPackageForm && (
                <div className={`${UI.card} p-6 space-y-5`}>
                  <h3 className="font-black text-lg text-gray-900 tracking-tight">Tambah Paket Baru</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "name", label: "Nama Paket", type: "text" },
                      { key: "duration", label: "Durasi (contoh: 1 Bulan)", type: "text" },
                      { key: "price", label: "Harga Paket (Rp)", type: "number" },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label className={UI.label}>{label}</label>
                        <input
                          type={type}
                          value={(packageForm as any)[key] || ""}
                          onChange={(e) => setPackageForm({ ...packageForm, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
                          className={UI.input}
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className={UI.label}>Deskripsi Paket</label>
                      <textarea
                        rows={2}
                        value={packageForm.description || ""}
                        onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                        className={`${UI.input} resize-none`}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSavePackage} className={UI.btnPrimary}>Simpan</button>
                    <button onClick={() => setShowPackageForm(false)} className={UI.btnSecondary}>Batal</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {packages.map((pkg) => (
                  <div key={pkg.id} className={`${UI.card} p-5 space-y-3 hover:shadow-md transition-shadow`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-base text-gray-900 tracking-tight">{pkg.name}</h4>
                        <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#111d5e] text-[10px] font-bold">{pkg.duration}</span>
                      </div>
                      <button onClick={() => handleDeletePackage(pkg.id)} className={`${UI.iconBtnDanger} shrink-0`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xl font-black text-[#111d5e]">{formatRupiah(pkg.price)}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{pkg.description || "-"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === USERS TAB === */}
          {tab === "users" && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-500">{users.length} pengguna terdaftar</p>
              <div className={`${UI.card} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className={UI.th}>Nama</th>
                        <th className={UI.th}>Email</th>
                        <th className={UI.th}>Telepon</th>
                        <th className={`${UI.th} text-center`}>Role</th>
                        <th className={`${UI.th} text-center`}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-gray-900">{u.name}</td>
                          <td className="px-4 py-3.5 text-gray-600">{u.email}</td>
                          <td className="px-4 py-3.5 text-gray-600">{u.phone || "-"}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`${UI.badgeBase} ${
                              u.role === "admin" ? UI.badgeAmber :
                              u.role === "petugas" ? UI.badgeGreen :
                              UI.badgeBlue
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {u.role !== "admin" && (
                              <button onClick={() => handleDeleteUser(u.id)} className={UI.iconBtnDanger}>
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
                  { label: "Total Order", value: orders.length, color: "text-gray-900" },
                  { label: "Order Berhasil (Paid)", value: orders.filter(o => o.status === "paid").length, color: "text-emerald-600" },
                  { label: "Order Pending", value: orders.filter(o => o.status === "pending").length, color: "text-amber-600" },
                ].map((stat) => (
                  <div key={stat.label} className={`${UI.card} p-5`}>
                    <p className={`text-3xl font-black tracking-tight ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className={`${UI.card} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className={UI.th}>Invoice</th>
                        <th className={UI.th}>Pembeli</th>
                        <th className={`${UI.th} text-right`}>Total</th>
                        <th className={`${UI.th} text-center`}>Status</th>
                        <th className={UI.th}>Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-semibold text-[#111d5e]">{order.invoice_code}</td>
                          <td className="px-4 py-3.5 text-gray-700">{(order as any).buyer_name || "-"}</td>
                          <td className="px-4 py-3.5 text-right font-bold text-gray-900">{formatRupiah(order.total)}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`${UI.badgeBase} ${orderStatusBadge(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-500">{formatDate(order.created_at)}</td>
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