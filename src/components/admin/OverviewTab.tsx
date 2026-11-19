"use client";

import React from "react";
import {
  Wallet,
  Ticket,
  CalendarDays,
  Users,
  Plus,
} from "lucide-react";
import {
  UI,
  Table,
  Badge,
  PAGE_SIZE,
  SERVICE_FEE,
  type AdminTab,
} from "./adminShared";
import { formatRupiah, formatDate, getStatusLabel } from "@/lib/utils";
import type { Order } from "@/services/orderService";
import type { Event } from "@/services/eventService";
import type { User as AuthUser } from "@/lib/auth";
import type { AdminDashboard } from "@/services/dashboardService";

interface OverviewTabProps {
  user: any;
  orders: Order[];
  events: Event[];
  users: AuthUser[];
  dashboard: AdminDashboard | null;
  setTab: (tab: AdminTab) => void;
  openCreateEvent: () => void;
}

export default function OverviewTab({
  user,
  orders,
  events,
  users,
  dashboard,
  setTab,
  openCreateEvent,
}: OverviewTabProps) {
  const ticketCountOf = (o: Order): number => {
    const a = o as any;
    if (typeof a.quantity === "number") return a.quantity;
    if (typeof a.total_tickets === "number") return a.total_tickets;
    if (Array.isArray(a.items))
      return a.items.reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0);
    if (Array.isArray(a.tickets)) return a.tickets.length;
    return 1;
  };

  const paidOrders = orders.filter((o) => o.status === "paid");
  const ticketsSold = paidOrders.reduce((sum, o) => sum + ticketCountOf(o), 0);
  const serviceRevenue = paidOrders.length * SERVICE_FEE;

  const stats = [
    {
      label: "Pendapatan Layanan",
      value: formatRupiah(serviceRevenue),
      icon: <Wallet className="w-5 h-5" />,
      chip: "bg-blue-50 text-[#111d5e]",
    },
    {
      label: "Tiket Terjual",
      value: ticketsSold.toLocaleString("id-ID"),
      icon: <Ticket className="w-5 h-5" />,
      chip: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Total Event",
      value: String(dashboard?.total_events || events.length),
      icon: <CalendarDays className="w-5 h-5" />,
      chip: "bg-amber-50 text-amber-600",
    },
    {
      label: "Total Pengguna",
      value: String(dashboard?.total_users || users.length),
      icon: <Users className="w-5 h-5" />,
      chip: "bg-violet-50 text-violet-600",
    },
  ];

  const orderHead = [
    { label: "Invoice" },
    { label: "Pembeli" },
    { label: "Total", align: "right" as const },
    { label: "Status" },
    { label: "Tanggal" },
  ];

  const orderBadge = (status: string) => (
    <Badge tone={status === "paid" ? "green" : status === "pending" ? "amber" : "red"}>
      {getStatusLabel(status)}
    </Badge>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#111d5e] text-white p-6 sm:p-7 shadow-xs">
        <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/[0.05]" />
        <div className="absolute right-24 -bottom-24 w-48 h-48 rounded-full bg-white/[0.04]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h2 className="text-xl font-bold">Halo, {user?.name?.split(" ")[0] || "Admin"}</h2>
            <p className="text-sm text-blue-100/80 mt-1">
              {orders.filter((o) => o.status === "pending").length} pesanan menunggu pembayaran dan{" "}
              {events.filter((e) => e.status === "draft").length} event masih berstatus draft.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={openCreateEvent}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-[#111d5e] text-sm font-semibold hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Event
            </button>
            <button
              onClick={() => setTab("banners")}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-white/25 text-white text-sm font-semibold hover:bg-white/10 transition-colors cursor-pointer"
            >
              Kelola Banner
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`${UI.card} p-5 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.chip}`}>
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500">{s.label}</p>
              <p className="text-xl font-black text-gray-900 tabular-nums truncate">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Transaksi Terbaru */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Transaksi Terbaru</h2>
          <button onClick={() => setTab("orders")} className={UI.btnLink}>
            Lihat Semua Transaksi
          </button>
        </div>
        <Table head={orderHead} empty="Belum ada transaksi pembelian tiket.">
          {orders.slice(0, PAGE_SIZE).map((order) => (
            <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
              <td className={`${UI.td} font-mono text-[13px] font-bold text-gray-900`}>
                {order.invoice_code}
              </td>
              <td className={UI.td}>{(order as any).buyer_name || "-"}</td>
              <td className={`${UI.td} text-right font-bold text-[#111d5e]`}>
                {formatRupiah(order.total)}
              </td>
              <td className={UI.td}>{orderBadge(order.status)}</td>
              <td className={`${UI.td} text-gray-500`}>{formatDate(order.created_at)}</td>
            </tr>
          ))}
        </Table>
      </section>
    </div>
  );
}

