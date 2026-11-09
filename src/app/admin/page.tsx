"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { getAdminDashboard, type AdminDashboard } from "@/services/dashboardService";
import { getEvents, createEvent, updateEvent, deleteEvent, publishEvent, type Event } from "@/services/eventService";
import {
  getBanners, createBanner, updateBanner, toggleBanner, deleteBanner,
  resolveBannerImageUrl, type Banner,
} from "@/services/bannerService";
import { getPackages, createPackage, deletePackage, type CooperationPackage } from "@/services/packageService";
import { getOrganizers, type Organizer } from "@/services/organizerService";
import { getUsers, deleteUser } from "@/services/userService";
import { getAllOrders, type Order } from "@/services/orderService";
import { getTicketCategories, createTicketCategory, updateTicketCategory, deleteTicketCategory, type TicketCategory } from "@/services/ticketService";
import { formatDate, formatRupiah, getStatusLabel } from "@/lib/utils";
import type { User as AuthUser } from "@/lib/auth";
import {
  LayoutDashboard, CalendarDays, Users, Package, Receipt, ImageIcon, LogOut, Wallet,
  Plus, Trash2, Pencil, Menu, X, Upload, Link as LinkIcon, Check, Ticket,
} from "lucide-react";

type AdminTab = "overview" | "events" | "banners" | "packages" | "users" | "orders";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80";

/* ---------- Design tokens ---------- */
const UI = {
  card: "bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(17,29,94,0.06)]",
  input:
    "w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#111d5e] focus:ring-1 focus:ring-[#111d5e]",
  label: "block text-sm font-medium text-gray-700 mb-1",
  hint: "text-xs text-gray-500 mt-1",
  btn: "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#111d5e] hover:bg-[#0c1543] disabled:opacity-60 disabled:cursor-not-allowed transition-colors",
  btnGhost:
    "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors",
  btnLink: "text-sm font-medium text-[#111d5e] hover:underline",
  iconBtn: "p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors",
  iconBtnDanger: "p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors",
  th: "px-5 py-3 text-left text-xs font-medium text-gray-500",
  td: "px-5 py-3.5 text-sm text-gray-700",
};

const TONE: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
  gray: "bg-gray-100 text-gray-600",
};
const DOT: Record<string, string> = {
  green: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500", blue: "bg-blue-500", gray: "bg-gray-400",
};

const TAB_DESC: Record<AdminTab, string> = {
  overview: "Gambaran singkat performa penjualan dan aktivitas platform.",
  events: "Buat, publikasikan, dan atur tiket untuk setiap event.",
  banners: "Atur banner yang tampil di beranda.",
  packages: "Paket yang ditawarkan kepada event organizer.",
  users: "Daftar akun yang terdaftar di TixGoo.",
  orders: "Semua transaksi pembelian tiket.",
};

/* ---------- Small building blocks ---------- */
function Badge({ tone, children }: { tone: keyof typeof TONE; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${TONE[tone]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT[tone]}`} />
      {children}
    </span>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className={UI.label}>{label}</label>
      {children}
    </div>
  );
}

function Table({ head, children, empty }: { head: { label: string; align?: "right" | "center" }[]; children: React.ReactNode; empty?: string }) {
  const hasRows = React.Children.count(children) > 0;
  return (
    <div className={`${UI.card} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {head.map((h) => (
                <th key={h.label} className={`${UI.th} ${h.align === "right" ? "text-right" : h.align === "center" ? "text-center" : ""}`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">{children}</tbody>
        </table>
      </div>
      {!hasRows && <p className="text-sm text-gray-500 text-center py-10">{empty || "Belum ada data."}</p>}
    </div>
  );
}

function FormPanel({ title, onClose, children }: { title: string; onClose?: () => void; children: React.ReactNode }) {
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

function SectionBar({ text, action }: { text: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-gray-500">{text}</p>
      {action}
    </div>
  );
}

/** Input rupiah: ketik angka saja, tampil otomatis sebagai 90.000 */
function RupiahInput({ value, onChange }: { value?: number; onChange: (n: number) => void }) {
  const display = value ? new Intl.NumberFormat("id-ID").format(value) : "";
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">Rp</span>
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

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, role, loading: authLoading, logout } = useAuth();

  const [tab, setTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [eventForm, setEventForm] = useState<Partial<Event>>({});

  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState<Partial<TicketCategory>>({});
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);

  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({});
  const [bannerImageMode, setBannerImageMode] = useState<"file" | "url">("file");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [bannerSaving, setBannerSaving] = useState(false);

  const [showPackageForm, setShowPackageForm] = useState(false);
  const [packageForm, setPackageForm] = useState<Partial<CooperationPackage>>({});

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== "admin")) router.push("/login");
  }, [authLoading, isAuthenticated, role]);

  useEffect(() => {
    if (isAuthenticated && role === "admin") fetchAll();
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (selectedEventForTickets) fetchTicketCategories(selectedEventForTickets);
  }, [selectedEventForTickets]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [dashRes, evtRes, banRes, pkgRes, orgRes, usrRes, ordRes] = await Promise.allSettled([
        getAdminDashboard(), getEvents(), getBanners(), getPackages(), getOrganizers(), getUsers(), getAllOrders(),
      ]);
      if (dashRes.status === "fulfilled") setDashboard(dashRes.value as any);
      if (evtRes.status === "fulfilled") setEvents(Array.isArray(evtRes.value) ? evtRes.value : []);
      if (banRes.status === "fulfilled") setBanners(Array.isArray(banRes.value) ? banRes.value : []);
      if (pkgRes.status === "fulfilled") setPackages(Array.isArray(pkgRes.value) ? pkgRes.value : []);
      if (orgRes.status === "fulfilled") setOrganizers(Array.isArray(orgRes.value) ? orgRes.value : []);
      if (usrRes.status === "fulfilled") setUsers(Array.isArray(usrRes.value) ? usrRes.value : []);
      if (ordRes.status === "fulfilled") setOrders(Array.isArray(ordRes.value) ? ordRes.value : []);
    } catch {
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

  /** Jalankan aksi async, tampilkan pesan sukses / error, lalu muat ulang data */
  const run = async (fn: () => Promise<unknown>, okMsg: string, after?: () => void) => {
    try {
      await fn();
      showSuccess(okMsg);
      after?.();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    }
  };

  // --- Events ---
  const closeEventForm = () => { setShowEventForm(false); setEventForm({}); setEditingEvent(null); };
  const handleSaveEvent = () =>
    run(
      () => (editingEvent?.id ? updateEvent(editingEvent.id, eventForm) : createEvent(eventForm)),
      editingEvent?.id ? "Event diperbarui" : "Event ditambahkan",
      () => { closeEventForm(); fetchAll(); }
    );
  const handleDeleteEvent = (id: string) =>
    confirm("Hapus event ini?") && run(() => deleteEvent(id), "Event dihapus", fetchAll);
  const handlePublishEvent = (id: string) => run(() => publishEvent(id), "Event dipublikasikan", fetchAll);

  // --- Ticket categories ---
  const closeTicketForm = () => { setShowTicketForm(false); setTicketForm({}); setEditingTicketId(null); };
  const openEditTicket = (cat: TicketCategory) => {
    setEditingTicketId(String(cat.id));
    setTicketForm({ name: cat.name, price: cat.price, stock: cat.stock });
    setShowTicketForm(true);
  };
  const handleSaveTicketCategory = () => {
    if (!ticketForm.name?.trim()) { setError("Nama kategori wajib diisi"); return; }
    const data = { name: ticketForm.name.trim(), price: ticketForm.price || 0, stock: ticketForm.stock || 0 };
    return run(
      () =>
        editingTicketId
          ? updateTicketCategory(editingTicketId, data as any)
          : createTicketCategory({ ...data, event_id: selectedEventForTickets } as any),
      editingTicketId ? "Kategori tiket diperbarui" : "Kategori tiket ditambahkan",
      () => { closeTicketForm(); fetchTicketCategories(selectedEventForTickets); }
    );
  };
  const handleDeleteTicketCategory = (id: string) =>
    confirm("Hapus kategori tiket ini?") &&
    run(() => deleteTicketCategory(id), "Kategori tiket dihapus", () => fetchTicketCategories(selectedEventForTickets));

  // --- Banners ---
  const closeBannerForm = () => {
    setShowBannerForm(false); setEditingBanner(null); setBannerForm({}); setBannerFile(null); setBannerPreview("");
  };

  const openCreateBanner = () => {
    setEditingBanner(null);
    setBannerForm({ title: "", link_url: "/events", is_active: true, image: "" });
    setBannerFile(null);
    setBannerPreview("");
    setBannerImageMode("file");
    setShowBannerForm(true);
  };

  const openEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      link_url: banner.link_url || "/events",
      is_active: banner.is_active,
      image: banner.image || banner.image_url || "",
    });
    setBannerFile(null);
    setBannerPreview(resolveBannerImageUrl(banner.image || banner.image_url));
    setBannerImageMode(banner.image && banner.image.startsWith("http") ? "url" : "file");
    setShowBannerForm(true);
  };

  const handleSaveBanner = async () => {
    try {
      setBannerSaving(true);
      if (!bannerForm.title?.trim()) throw new Error("Judul banner wajib diisi");
      if (bannerImageMode === "file" && !bannerFile && !editingBanner?.image) throw new Error("Pilih file gambar banner");
      if (bannerImageMode === "url" && !bannerForm.image?.trim() && !editingBanner?.image) throw new Error("URL gambar banner wajib diisi");

      const title = bannerForm.title.trim();
      const link_url = bannerForm.link_url?.trim() || "/events";
      const is_active = bannerForm.is_active !== false;

      let payload: FormData | Partial<Banner>;
      if (bannerImageMode === "file" && bannerFile) {
        const fd = new FormData();
        fd.append("title", title);
        fd.append("link_url", link_url);
        fd.append("is_active", String(is_active));
        fd.append("image", bannerFile);
        payload = fd;
      } else {
        payload = { title, link_url, is_active, image: bannerForm.image?.trim() || editingBanner?.image || "" };
      }

      if (editingBanner?.id) {
        await updateBanner(editingBanner.id, payload as any);
        showSuccess("Banner diperbarui");
      } else {
        await createBanner(payload as any);
        showSuccess("Banner ditambahkan");
      }
      closeBannerForm();
      fetchAll();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan banner");
    } finally {
      setBannerSaving(false);
    }
  };

  const handleToggleBanner = (id: number | string) => run(() => toggleBanner(id), "Status banner diubah", fetchAll);
  const handleDeleteBanner = (id: number | string) =>
    confirm("Hapus banner ini?") && run(() => deleteBanner(id), "Banner dihapus", fetchAll);

  // --- Packages & users ---
  const handleSavePackage = () =>
    run(() => createPackage(packageForm), "Paket ditambahkan", () => { setShowPackageForm(false); setPackageForm({}); fetchAll(); });
  const handleDeletePackage = (id: number) =>
    confirm("Hapus paket ini?") && run(() => deletePackage(id), "Paket dihapus", fetchAll);
  const handleDeleteUser = (id: string) =>
    confirm("Hapus pengguna ini?") && run(() => deleteUser(id), "Pengguna dihapus", fetchAll);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f5fa]">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="w-5 h-5 border-2 border-[#111d5e] border-t-transparent rounded-full animate-spin" />
          Memuat dashboard…
        </div>
      </div>
    );
  }

  if (!isAuthenticated || role !== "admin") return null;

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Ringkasan", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "events", label: "Event", icon: <CalendarDays className="w-4 h-4" /> },
    { id: "banners", label: "Banner promo", icon: <ImageIcon className="w-4 h-4" /> },
    { id: "packages", label: "Paket kerja sama", icon: <Package className="w-4 h-4" /> },
    { id: "users", label: "Pengguna", icon: <Users className="w-4 h-4" /> },
    { id: "orders", label: "Penjualan", icon: <Receipt className="w-4 h-4" /> },
  ];

  const orderBadge = (status: string) => (
    <Badge tone={status === "paid" ? "green" : status === "pending" ? "amber" : "red"}>{getStatusLabel(status)}</Badge>
  );

  const orderHead = [
    { label: "Invoice" }, { label: "Pembeli" }, { label: "Total", align: "right" as const },
    { label: "Status" }, { label: "Tanggal" },
  ];

  const orderRow = (order: Order) => (
    <tr key={order.id} className="hover:bg-gray-50">
      <td className={`${UI.td} font-mono text-[13px] text-gray-900`}>{order.invoice_code}</td>
      <td className={UI.td}>{(order as any).buyer_name || "-"}</td>
      <td className={`${UI.td} text-right font-medium text-gray-900`}>{formatRupiah(order.total)}</td>
      <td className={UI.td}>{orderBadge(order.status)}</td>
      <td className={`${UI.td} text-gray-500`}>{formatDate(order.created_at)}</td>
    </tr>
  );

  const eventFields: { key: string; label: string; type: string }[] = [
    { key: "name", label: "Nama event", type: "text" },
    { key: "city", label: "Kota", type: "text" },
    { key: "venue", label: "Venue", type: "text" },
    { key: "capacity", label: "Kapasitas", type: "number" },
    { key: "event_date", label: "Tanggal", type: "date" },
    { key: "event_time", label: "Waktu", type: "time" },
    { key: "genre", label: "Genre musik", type: "text" },
    { key: "poster", label: "URL poster", type: "url" },
  ];

  const stats = [
    { label: "Total pendapatan", value: formatRupiah(dashboard?.total_revenue || 0), icon: <Wallet className="w-5 h-5" />, chip: "bg-blue-50 text-[#111d5e]" },
    { label: "Tiket terjual", value: (dashboard?.total_tickets || 0).toLocaleString("id-ID"), icon: <Ticket className="w-5 h-5" />, chip: "bg-emerald-50 text-emerald-600" },
    { label: "Event", value: String(dashboard?.total_events || events.length), icon: <CalendarDays className="w-5 h-5" />, chip: "bg-amber-50 text-amber-600" },
    { label: "Pengguna", value: String(dashboard?.total_users || users.length), icon: <Users className="w-5 h-5" />, chip: "bg-violet-50 text-violet-600" },
  ];

  const activeBanners = banners.filter((b) => b.is_active).length;

  return (
    <div className="min-h-screen flex bg-[#f3f5fa] text-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-white border-r border-gray-200 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-gray-200 shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo-tix.png" alt="TixGoo" className="h-8 w-auto object-contain" />
            <span className="text-xs font-medium text-gray-500 border-l border-gray-200 pl-2.5">Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className={`lg:hidden ${UI.iconBtn}`} aria-label="Tutup menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                tab === item.id
                  ? "bg-[#111d5e]/[0.08] text-[#111d5e] font-semibold shadow-[inset_3px_0_0_#111d5e]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || "AD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button
              onClick={() => { logout(); router.push("/"); }}
              className={UI.iconBtnDanger}
              title="Keluar"
              aria-label="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200 h-16 flex items-center gap-3 px-4 sm:px-8">
          <button onClick={() => setSidebarOpen(true)} className={`lg:hidden ${UI.iconBtn}`} aria-label="Buka menu">
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">{navItems.find((n) => n.id === tab)?.label}</h1>
            <p className="hidden sm:block text-xs text-gray-500 truncate">{TAB_DESC[tab]}</p>
          </div>

          {successMsg && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
              <Check className="w-4 h-4" /> {successMsg}
            </div>
          )}
          {error && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
              <button onClick={() => setError(null)} aria-label="Tutup pesan">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8">
          {/* ===== OVERVIEW ===== */}
          {tab === "overview" && (
            <div className="space-y-8">
              <div className="relative overflow-hidden rounded-2xl bg-[#111d5e] text-white p-6 sm:p-7">
                <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/[0.05]" />
                <div className="absolute right-24 -bottom-24 w-48 h-48 rounded-full bg-white/[0.04]" />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div>
                    <h2 className="text-xl font-semibold">Halo, {user?.name?.split(" ")[0] || "Admin"}</h2>
                    <p className="text-sm text-blue-100/80 mt-1">
                      {orders.filter((o) => o.status === "pending").length} order menunggu pembayaran dan{" "}
                      {events.filter((e) => e.status === "draft").length} event masih draft.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => { setTab("events"); setShowEventForm(true); setEditingEvent(null); setEventForm({}); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-[#111d5e] text-sm font-medium hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Tambah event
                    </button>
                    <button
                      onClick={() => setTab("banners")}
                      className="inline-flex items-center px-4 py-2 rounded-lg border border-white/25 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      Kelola banner
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className={`${UI.card} p-5 flex items-center gap-4`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.chip}`}>{s.icon}</div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">{s.label}</p>
                      <p className="text-xl font-semibold text-gray-900 tabular-nums truncate">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">Transaksi terbaru</h2>
                  <button onClick={() => setTab("orders")} className={UI.btnLink}>Lihat semua</button>
                </div>
                <Table head={orderHead} empty="Belum ada transaksi.">
                  {orders.slice(0, 8).map(orderRow)}
                </Table>
              </section>
            </div>
          )}

          {/* ===== EVENTS ===== */}
          {tab === "events" && (
            <div className="space-y-6">
              <SectionBar
                text={`${events.length} event`}
                action={
                  <button
                    onClick={() => { setShowEventForm(true); setEditingEvent(null); setEventForm({}); }}
                    className={UI.btn}
                  >
                    <Plus className="w-4 h-4" /> Tambah event
                  </button>
                }
              />

              {showEventForm && (
                <FormPanel title={editingEvent?.id ? "Edit event" : "Event baru"} onClose={closeEventForm}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {eventFields.map(({ key, label, type }) => (
                      <Field key={key} label={label}>
                        <input
                          type={type}
                          value={(eventForm as any)[key] || ""}
                          onChange={(e) => setEventForm({ ...eventForm, [key]: e.target.value })}
                          className={UI.input}
                        />
                      </Field>
                    ))}
                    <Field label="Organizer" className="sm:col-span-2">
                      <select
                        value={(eventForm as any).organizer_id || ""}
                        onChange={(e) => setEventForm({ ...eventForm, organizer_id: e.target.value })}
                        className={UI.input}
                      >
                        <option value="">Tanpa organizer</option>
                        {organizers.map((o) => (
                          <option key={o.id} value={o.id}>{o.name} - {o.company_name}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Deskripsi" className="sm:col-span-2">
                      <textarea
                        rows={3}
                        value={(eventForm as any).description || ""}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        className={`${UI.input} resize-none`}
                      />
                    </Field>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button onClick={handleSaveEvent} className={UI.btn}>
                      {editingEvent?.id ? "Simpan perubahan" : "Simpan event"}
                    </button>
                    <button onClick={closeEventForm} className={UI.btnGhost}>Batal</button>
                  </div>
                </FormPanel>
              )}

              <Table
                head={[{ label: "Nama event" }, { label: "Kota" }, { label: "Tanggal" }, { label: "Status" }, { label: "", align: "right" }]}
                empty="Belum ada event."
              >
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className={UI.td}>
                      <div className="flex items-center gap-3">
                        {(event as any).poster ? (
                          <img src={(event as any).poster} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" onError={(e: any) => { e.target.style.visibility = "hidden"; }} />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#111d5e] flex items-center justify-center shrink-0">
                            <CalendarDays className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{event.name}</span>
                      </div>
                    </td>
                    <td className={UI.td}>{event.city || "-"}</td>
                    <td className={UI.td}>{formatDate(event.event_date)}</td>
                    <td className={UI.td}>
                      <Badge tone={event.status === "published" ? "green" : event.status === "draft" ? "gray" : "amber"}>
                        {getStatusLabel(event.status)}
                      </Badge>
                    </td>
                    <td className={UI.td}>
                      <div className="flex items-center justify-end gap-1">
                        {event.status === "draft" && (
                          <button onClick={() => handlePublishEvent(event.id)} className={`${UI.btnLink} px-2`}>
                            Publikasikan
                          </button>
                        )}
                        <button onClick={() => setSelectedEventForTickets(event.id)} className={UI.iconBtn} title="Kategori tiket">
                          <Ticket className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditingEvent(event); setEventForm(event); setShowEventForm(true); }}
                          className={UI.iconBtn}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteEvent(event.id)} className={UI.iconBtnDanger} title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>

              {selectedEventForTickets && (
                <section className={`${UI.card} p-6 space-y-4`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-gray-900">
                      Kategori tiket · {events.find((e) => e.id === selectedEventForTickets)?.name}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { if (showTicketForm) closeTicketForm(); else { setEditingTicketId(null); setTicketForm({}); setShowTicketForm(true); } }}
                        className={UI.btn}
                      >
                        <Plus className="w-4 h-4" /> Tambah kategori
                      </button>
                      <button onClick={() => { setSelectedEventForTickets(""); closeTicketForm(); }} className={UI.btnGhost}>
                        Tutup
                      </button>
                    </div>
                  </div>

                  {showTicketForm && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <p className="text-sm font-medium text-gray-900">
                        {editingTicketId ? "Edit kategori tiket" : "Kategori tiket baru"}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Nama (VIP, Regular, dll)">
                          <input
                            type="text"
                            value={ticketForm.name || ""}
                            onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                            className={UI.input}
                          />
                        </Field>
                        <Field label="Harga">
                          <RupiahInput value={ticketForm.price} onChange={(n) => setTicketForm({ ...ticketForm, price: n })} />
                        </Field>
                        <Field label="Stok">
                          <input
                            type="number"
                            min={0}
                            value={ticketForm.stock ?? ""}
                            onChange={(e) => setTicketForm({ ...ticketForm, stock: Number(e.target.value) })}
                            className={UI.input}
                          />
                        </Field>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleSaveTicketCategory} className={UI.btn}>
                          {editingTicketId ? "Simpan perubahan" : "Simpan"}
                        </button>
                        <button onClick={closeTicketForm} className={UI.btnGhost}>Batal</button>
                      </div>
                    </div>
                  )}

                  {ticketCategories.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">Event ini belum punya kategori tiket.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                      {ticketCategories.map((cat) => (
                        <li key={cat.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                            <span className="font-medium text-gray-900">{cat.name}</span>
                            <span className="text-gray-600">{formatRupiah(cat.price)}</span>
                            <span className="text-gray-500">Stok {cat.stock}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => openEditTicket(cat)} className={UI.iconBtn} title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteTicketCategory(cat.id)} className={UI.iconBtnDanger} title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </div>
          )}

          {/* ===== BANNERS ===== */}
          {tab === "banners" && (
            <div className="space-y-6">
              <SectionBar
                text={`${banners.length} banner, ${activeBanners} aktif di beranda`}
                action={
                  <button onClick={openCreateBanner} className={UI.btn}>
                    <Plus className="w-4 h-4" /> Tambah banner
                  </button>
                }
              />

              {showBannerForm && (
                <FormPanel title={editingBanner?.id ? "Edit banner" : "Banner baru"} onClose={closeBannerForm}>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-4">
                      <Field label="Judul">
                        <input
                          type="text"
                          value={bannerForm.title || ""}
                          onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                          placeholder="Contoh: Sheila On 7 Tunggu Aku Di Jakarta 2026"
                          className={UI.input}
                        />
                      </Field>

                      <Field label="Link tujuan">
                        <input
                          type="text"
                          value={bannerForm.link_url || ""}
                          onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
                          placeholder="/events atau https://…"
                          className={UI.input}
                        />
                        <p className={UI.hint}>Halaman yang dibuka saat banner diklik.</p>
                      </Field>

                      <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bannerForm.is_active !== false}
                          onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-[#111d5e] focus:ring-[#111d5e]"
                        />
                        Tampilkan di beranda
                      </label>

                      <div>
                        <span className={UI.label}>Gambar</span>
                        <div className="inline-flex p-0.5 bg-gray-100 rounded-lg mb-3">
                          {([["file", "Upload file", Upload], ["url", "Pakai URL", LinkIcon]] as const).map(([mode, text, Icon]) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setBannerImageMode(mode)}
                              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors ${
                                bannerImageMode === mode ? "bg-white text-gray-900 font-medium shadow-sm" : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" /> {text}
                            </button>
                          ))}
                        </div>

                        {bannerImageMode === "file" ? (
                          <>
                            <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#111d5e] hover:bg-gray-50 transition-colors">
                              <Upload className="w-5 h-5 text-gray-400 mb-1.5" />
                              <span className="text-sm text-gray-700">{bannerFile ? bannerFile.name : "Pilih gambar dari perangkat"}</span>
                              <span className="text-xs text-gray-400 mt-0.5">PNG, JPG, atau WEBP, maks. 10 MB</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setBannerFile(file);
                                    setBannerPreview(URL.createObjectURL(file));
                                  }
                                }}
                              />
                            </label>
                            {bannerFile && (
                              <p className="text-xs text-gray-500 mt-1.5">{(bannerFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            )}
                          </>
                        ) : (
                          <>
                            <input
                              type="url"
                              value={bannerForm.image || ""}
                              onChange={(e) => {
                                setBannerForm({ ...bannerForm, image: e.target.value });
                                setBannerPreview(e.target.value);
                              }}
                              className={UI.input}
                              placeholder="https://…"
                            />
                            <p className={UI.hint}>Tempel tautan langsung ke gambar.</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <span className={UI.label}>Pratinjau</span>
                      <div className="relative aspect-[16/10] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                        {bannerPreview ? (
                          <>
                            <img
                              src={bannerPreview}
                              alt="Pratinjau banner"
                              className="w-full h-full object-cover"
                              onError={(e: any) => { e.target.src = FALLBACK_IMG; }}
                            />
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-black/55 text-white">
                              <p className="text-sm font-medium line-clamp-1">{bannerForm.title || "Judul banner"}</p>
                            </div>
                          </>
                        ) : (
                          <div className="text-center text-gray-400">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1.5" />
                            <p className="text-sm">Belum ada gambar</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6 pt-5 border-t border-gray-100">
                    <button onClick={handleSaveBanner} disabled={bannerSaving} className={UI.btn}>
                      {bannerSaving ? "Menyimpan…" : editingBanner?.id ? "Simpan perubahan" : "Simpan banner"}
                    </button>
                    <button onClick={closeBannerForm} disabled={bannerSaving} className={UI.btnGhost}>Batal</button>
                  </div>
                </FormPanel>
              )}

              {banners.length === 0 ? (
                <div className={`${UI.card} py-14 text-center`}>
                  <ImageIcon className="w-8 h-8 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-900">Belum ada banner</p>
                  <p className="text-sm text-gray-500 mt-1 mb-4">Banner aktif akan tampil bergantian di beranda.</p>
                  <button onClick={openCreateBanner} className={UI.btn}>
                    <Plus className="w-4 h-4" /> Tambah banner
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {banners.map((banner) => (
                    <article key={banner.id} className={`${UI.card} overflow-hidden flex flex-col`}>
                      <div className="aspect-[16/9] bg-gray-100">
                        <img
                          src={resolveBannerImageUrl(banner.image || banner.image_url)}
                          alt={banner.title}
                          className={`w-full h-full object-cover ${banner.is_active ? "" : "grayscale opacity-60"}`}
                          onError={(e: any) => { e.target.src = FALLBACK_IMG; }}
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col gap-3">
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">{banner.title}</h4>
                          <p className="text-xs text-gray-500 mt-1 truncate">{banner.link_url || "/events"}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleToggleBanner(banner.id)}
                            className="flex items-center gap-2 text-sm text-gray-700"
                            title={banner.is_active ? "Nonaktifkan" : "Aktifkan"}
                            role="switch"
                            aria-checked={!!banner.is_active}
                          >
                            <span className={`relative w-8 h-[18px] rounded-full transition-colors ${banner.is_active ? "bg-emerald-500" : "bg-gray-300"}`}>
                              <span className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform ${banner.is_active ? "translate-x-[14px]" : ""}`} />
                            </span>
                            {banner.is_active ? "Aktif" : "Nonaktif"}
                          </button>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => openEditBanner(banner)} className={UI.iconBtn} title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteBanner(banner.id)} className={UI.iconBtnDanger} title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== PACKAGES ===== */}
          {tab === "packages" && (
            <div className="space-y-6">
              <SectionBar
                text={`${packages.length} paket`}
                action={
                  <button onClick={() => setShowPackageForm(!showPackageForm)} className={UI.btn}>
                    <Plus className="w-4 h-4" /> Tambah paket
                  </button>
                }
              />

              {showPackageForm && (
                <FormPanel title="Paket baru" onClose={() => setShowPackageForm(false)}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "name", label: "Nama paket", type: "text" },
                      { key: "duration", label: "Durasi (contoh: 1 bulan)", type: "text" },
                      { key: "price", label: "Harga (Rp)", type: "number" },
                    ].map(({ key, label, type }) => (
                      <Field key={key} label={label}>
                        {key === "price" ? (
                          <RupiahInput value={packageForm.price} onChange={(n) => setPackageForm({ ...packageForm, price: n })} />
                        ) : (
                          <input
                            type={type}
                            value={(packageForm as any)[key] || ""}
                            onChange={(e) => setPackageForm({ ...packageForm, [key]: e.target.value })}
                            className={UI.input}
                          />
                        )}
                      </Field>
                    ))}
                    <Field label="Deskripsi" className="sm:col-span-2">
                      <textarea
                        rows={2}
                        value={packageForm.description || ""}
                        onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                        className={`${UI.input} resize-none`}
                      />
                    </Field>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button onClick={handleSavePackage} className={UI.btn}>Simpan paket</button>
                    <button onClick={() => setShowPackageForm(false)} className={UI.btnGhost}>Batal</button>
                  </div>
                </FormPanel>
              )}

              {packages.length === 0 ? (
                <p className={`${UI.card} text-sm text-gray-500 text-center py-10`}>Belum ada paket kerja sama.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className={`${UI.card} p-5 flex flex-col border-t-[3px] border-t-[#111d5e]`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">{pkg.name}</h4>
                          <p className="text-sm text-gray-500">{pkg.duration}</p>
                        </div>
                        <button onClick={() => handleDeletePackage(pkg.id)} className={UI.iconBtnDanger} title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xl font-semibold text-[#111d5e] mt-4 tabular-nums">{formatRupiah(pkg.price)}</p>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{pkg.description || "-"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== USERS ===== */}
          {tab === "users" && (
            <div className="space-y-4">
              <SectionBar text={`${users.length} pengguna`} />
              <Table
                head={[{ label: "Nama" }, { label: "Email" }, { label: "Telepon" }, { label: "Role" }, { label: "", align: "right" }]}
                empty="Belum ada pengguna."
              >
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className={UI.td}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#111d5e]/10 text-[#111d5e] text-xs font-semibold flex items-center justify-center shrink-0">
                          {u.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className={UI.td}>{u.email}</td>
                    <td className={UI.td}>{u.phone || "-"}</td>
                    <td className={UI.td}>
                      <Badge tone={u.role === "admin" ? "amber" : u.role === "petugas" ? "green" : "blue"}>
                        {u.role === "admin" ? "Admin" : u.role === "petugas" ? "Petugas" : "Pengguna"}
                      </Badge>
                    </td>
                    <td className={`${UI.td} text-right`}>
                      {u.role !== "admin" && (
                        <button onClick={() => handleDeleteUser(u.id)} className={UI.iconBtnDanger} title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}

          {/* ===== ORDERS ===== */}
          {tab === "orders" && (
            <div className="space-y-6">
              <div className={`${UI.card} grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100`}>
                {[
                  { label: "Total order", value: orders.length, dot: "bg-[#111d5e]" },
                  { label: "Berhasil dibayar", value: orders.filter((o) => o.status === "paid").length, dot: "bg-emerald-500" },
                  { label: "Menunggu pembayaran", value: orders.filter((o) => o.status === "pending").length, dot: "bg-amber-500" },
                ].map((s) => (
                  <div key={s.label} className="p-5">
                    <p className="text-sm text-gray-500 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${s.dot}`} />{s.label}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1.5 tabular-nums">{s.value}</p>
                  </div>
                ))}
              </div>
              <Table head={orderHead} empty="Belum ada order.">
                {orders.map(orderRow)}
              </Table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}