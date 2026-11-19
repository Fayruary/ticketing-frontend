"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import {
  UI,
  Table,
  Badge,
  SectionBar,
  Pagination,
  usePagination,
} from "./adminShared";
import { formatDate, formatRupiah, getStatusLabel } from "@/lib/utils";
import type { Order } from "@/services/orderService";

interface OrdersTabProps {
  orders: Order[];
}

export default function OrdersTab({ orders }: OrdersTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredOrders = orders.filter((o) => {
    const matchStatus = !statusFilter || o.status === statusFilter;
    if (!matchStatus) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (o.invoice_code && o.invoice_code.toLowerCase().includes(q)) ||
      ((o as any).buyer_name && (o as any).buyer_name.toLowerCase().includes(q)) ||
      ((o as any).buyer_email && (o as any).buyer_email.toLowerCase().includes(q))
    );
  });

  const orderPg = usePagination(filteredOrders);

  const orderHead = [
    { label: "Invoice" },
    { label: "Pembeli" },
    { label: "Total Pembayaran", align: "right" as const },
    { label: "Status" },
    { label: "Tanggal Pemesanan" },
  ];

  const orderBadge = (status: string) => (
    <Badge tone={status === "paid" ? "green" : status === "pending" ? "amber" : "red"}>
      {getStatusLabel(status)}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Summary KPI */}
      <div className={`${UI.card} grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100`}>
        {[
          { label: "Total Order", value: orders.length, dot: "bg-[#111d5e]" },
          {
            label: "Berhasil Dibayar (Lunas)",
            value: orders.filter((o) => o.status === "paid").length,
            dot: "bg-emerald-500",
          },
          {
            label: "Menunggu Pembayaran",
            value: orders.filter((o) => o.status === "pending").length,
            dot: "bg-amber-500",
          },
        ].map((s) => (
          <div key={s.label} className="p-5">
            <p className="text-xs font-semibold text-gray-500 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              {s.label}
            </p>
            <p className="text-2xl font-black text-gray-900 mt-1.5 tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <SectionBar
        text={`${filteredOrders.length} transaksi ditampilkan`}
        action={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-3 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:border-[#111d5e]"
            >
              <option value="">Semua Status</option>
              <option value="paid">Lunas (Paid)</option>
              <option value="pending">Menunggu (Pending)</option>
              <option value="failed">Gagal / Dibatalkan</option>
            </select>
            <div className="relative w-60">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari invoice atau pembeli..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#111d5e]"
              />
            </div>
          </div>
        }
      />

      <Table
        head={orderHead}
        empty="Belum ada transaksi pemesanan tiket."
        footer={<Pagination {...orderPg} onChange={orderPg.setPage} inCard />}
      >
        {orderPg.pageItems.map((order) => (
          <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
            <td className={`${UI.td} font-mono text-[13px] font-bold text-gray-900`}>
              {order.invoice_code}
            </td>
            <td className={UI.td}>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">{(order as any).buyer_name || "-"}</span>
                <span className="text-xs text-gray-400">{(order as any).buyer_email || ""}</span>
              </div>
            </td>
            <td className={`${UI.td} text-right font-black text-[#111d5e]`}>
              {formatRupiah(order.total)}
            </td>
            <td className={UI.td}>{orderBadge(order.status)}</td>
            <td className={`${UI.td} text-gray-500 text-xs`}>
              {formatDate(order.created_at)}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

