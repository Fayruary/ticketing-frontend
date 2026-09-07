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
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-zinc-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <TicketCheck className="w-4 h-4" />
              <span>Dompet Tiket Konsermu</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Tiket Saya</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Tunjukkan QR Code E-Ticket ini kepada petugas check-in di venue saat hari konser berlangsung.
            </p>
          </div>

          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Cari Tiket Konser Lainnya
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-44 rounded-3xl bg-zinc-900/60 animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 rounded-3xl glass-panel border border-rose-500/30 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold text-rose-300">{error}</p>
            <button
              onClick={fetchTickets}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-white"
            >
              Coba Lagi
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-zinc-800 text-center space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
              <TicketIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Belum Ada Tiket Konser</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Kamu belum membeli tiket konser apapun. Temukan konser favoritmu dan dapatkan E-Ticket QR Code secara instan!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
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
