"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TicketCard from "@/components/tickets/TicketCard";
import { getMyTickets, type Ticket } from "@/services/ticketService";
import useAuth from "@/hooks/useAuth";
import { TicketCheck, Ticket as TicketIcon, Search, Sparkles, AlertCircle } from "lucide-react";

export default function MyTicketsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/tickets");
      return;
    }

    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated, authLoading]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await getMyTickets();
      const ticketList = Array.isArray(res) ? res : res?.data || [];
      setTickets(ticketList);
    } catch (err: any) {
      console.error("Error fetching user tickets:", err);
      setError(err.message || "Gagal mengambil data tiket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-700 font-sans selection:bg-[#111d5e] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full bg-white">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[#111d5e] border border-slate-200 text-xs font-bold uppercase tracking-wider mb-2">
              <TicketCheck className="w-4 h-4 text-[#111d5e]" />
              <span>Dompet Tiket Konsermu</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tiket Saya</h1>
            <p className="text-xs text-gray-500 mt-1">
              Tunjukkan QR Code E-Ticket ini kepada petugas check-in di venue saat hari konser berlangsung.
            </p>
          </div>

          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gray-50 border border-gray-200 text-gray-700 hover:text-[#111d5e] hover:border-gray-300 transition-all flex items-center gap-2 shadow-xs"
          >
            <Search className="w-4 h-4 text-gray-500" />
            Cari Tiket Konser Lainnya
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-44 rounded-3xl bg-gray-100/70 animate-pulse border border-gray-200" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 rounded-3xl bg-red-50 border border-red-100 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <button
              onClick={fetchTickets}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-red-200 text-red-700 hover:bg-red-100 transition-all cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-gray-50/60 p-12 rounded-3xl border border-gray-200 text-center space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-[#111d5e] flex items-center justify-center mx-auto">
              <TicketIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">Belum Ada Tiket Konser</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Kamu belum membeli tiket konser apapun. Temukan konser favoritmu dan dapatkan E-Ticket QR Code secara instan!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-[#111d5e] hover:bg-[#0c1543] text-white shadow-lg transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-blue-300" />
              Jelajah Konser Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} buyerName={user?.name} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}