"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getMyOrders, type Order } from "@/services/orderService";
import useAuth from "@/hooks/useAuth";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Ticket,
  Search,
  ArrowLeft,
} from "lucide-react";

export default function OrdersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/orders");
      return;
    }
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await getMyOrders();
      const list = Array.isArray(res) ? res : res?.data || [];
      setOrders(list);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Gagal mengambil data pesanan");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: Order["status"]) => {
    switch (status) {
      case "paid":
        return {
          label: "Lunas",
          icon: <CheckCircle2 className="w-4 h-4" />,
          className: "text-emerald-700 bg-emerald-50 border-emerald-200",
        };
      case "pending":
        return {
          label: "Menunggu Pembayaran",
          icon: <Clock className="w-4 h-4" />,
          className: "text-amber-700 bg-amber-50 border-amber-200",
        };
      case "failed":
        return {
          label: "Gagal",
          icon: <XCircle className="w-4 h-4" />,
          className: "text-red-700 bg-red-50 border-red-200",
        };
      default:
        return {
          label: status,
          icon: <AlertCircle className="w-4 h-4" />,
          className: "text-gray-700 bg-gray-50 border-gray-200",
        };
    }
  };

  const formatRupiah = (val?: number | string) => {
    const num = Number(val);
    if (!num || isNaN(num)) return "Rp 0";
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#111d5e] mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Beranda
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Riwayat Pesanan</h1>
            <p className="text-sm text-gray-500 mt-1">
              Daftar semua transaksi pembelian tiket kamu.
            </p>
          </div>

          <Link
            href="/"
            className="px-4 py-2 rounded-xl font-bold text-xs bg-white border border-gray-200 text-gray-700 hover:text-[#111d5e] hover:border-[#111d5e] transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Cari Event
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 rounded-2xl bg-gray-100 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-red-200 text-red-600 hover:bg-red-50"
            >
              Coba Lagi
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-[#111d5e]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Pesanan</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Kamu belum pernah melakukan pembelian tiket. Temukan event favoritmu dan pesan sekarang!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-[#111d5e] text-white hover:bg-[#0c1543] transition-all shadow-lg"
            >
              <Search className="w-4 h-4" />
              Jelajah Event
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConf = getStatusConfig(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <Ticket className="w-6 h-6 text-[#111d5e]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono font-bold text-gray-900">
                          #{order.invoice_code || order.id?.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusConf.className}`}
                        >
                          {statusConf.icon}
                          {statusConf.label}
                        </span>
                      </div>
                      {order.event_name && (
                        <p className="text-sm font-semibold text-gray-800 truncate">{order.event_name}</p>
                      )}
                      <p className="text-[11px] text-gray-500 mt-0.5">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center gap-4 shrink-0 sm:ml-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-extrabold text-[#111d5e]">{formatRupiah(order.total)}</p>
                    </div>
                    {order.status === "paid" && (
                      <Link
                        href="/tickets"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#111d5e] text-white hover:bg-[#0c1543] transition-all"
                      >
                        Tiket Saya
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {order.status === "pending" && (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200">
                        Bayar Sekarang
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
