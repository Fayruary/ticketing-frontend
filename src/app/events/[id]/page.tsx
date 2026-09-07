"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getEventById, type Event } from "@/services/eventService";
import { getTicketCategories, type TicketCategory } from "@/services/ticketService";
import { getArtistsByEvent, type Artist } from "@/services/artistService";
import { formatDate, formatRupiah } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import {
  Calendar,
  MapPin,
  Ticket,
  User,
  Music,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  ArrowLeft,
  Sparkles,
  ShoppingBag
} from "lucide-react";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [eventRes, catRes, artistRes] = await Promise.all([
        getEventById(id),
        getTicketCategories(id).catch(() => []),
        getArtistsByEvent(id).catch(() => [])
      ]);

      const eventData = (eventRes as any)?.data || eventRes;
      setEvent(eventData);

      const catsData = Array.isArray(catRes) ? catRes : (catRes as any)?.data || [];
      setCategories(catsData);
      if (catsData.length > 0) {
        setSelectedCategoryId(catsData[0].id);
      }

      const artistData = Array.isArray(artistRes) ? artistRes : (artistRes as any)?.data || [];
      setArtists(artistData);
    } catch (err: any) {
      console.error("Error loading event detail:", err);
      setError(err.message || "Gagal memuat detail event");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const totalPrice = selectedCategory ? Number(selectedCategory.price) * quantity : 0;

  const handleProceedToCheckout = () => {
    if (!selectedCategory) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${id}`);
      return;
    }
    router.push(`/checkout/${id}?categoryId=${selectedCategory.id}&qty=${quantity}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-zinc-400">Memuat detail konser...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="w-16 h-16 text-rose-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Event Tidak Ditemukan</h2>
          <p className="text-sm text-zinc-400 mb-6">{error || "Event tidak tersedia atau telah dihapus."}</p>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-500 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Jelajah Konser
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const defaultPosters = [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"
  ];
  const posterUrl = event.poster && event.poster.startsWith("http")
    ? event.poster
    : defaultPosters[Math.abs(event.name.length) % defaultPosters.length];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Banner Hero */}
        <div className="relative h-80 sm:h-96 w-full bg-zinc-900 overflow-hidden border-b border-zinc-800">
          <img src={posterUrl} alt={event.name} className="w-full h-full object-cover brightness-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

          <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white mb-4 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-zinc-800 backdrop-blur-md">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                {event.genre || "Konser Musik"}
              </span>
              {event.city && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.city}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">{event.name}</h1>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Main Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Specs Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-4 rounded-2xl border border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase">Tanggal Konser</span>
                  <p className="text-xs font-bold text-white">{formatDate(event.event_date)}</p>
                </div>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase">Waktu Konser</span>
                  <p className="text-xs font-bold text-white">{event.event_time ? `${event.event_time.slice(0, 5)} WIB` : "19:00 WIB"}</p>
                </div>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase">Lokasi Venue</span>
                  <p className="text-xs font-bold text-white line-clamp-1">{event.venue || "Stadium Concert Hall"}</p>
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-800/80 space-y-4">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Tentang Event Konser Ini
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {event.description || "Rasakan pengalaman konser musik spektakuler dengan pencahayaan panggung kelas dunia dan tata suara luar biasa. Dapatkan tiket resmimu sekarang sebelum kehabisan kuota!"}
              </p>
            </div>

            {/* Line-up Artists */}
            {artists.length > 0 && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-800/80 space-y-4">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Music className="w-5 h-5 text-pink-400" />
                  Line Up Artist & Pengisi Acara
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {artists.map((artist) => (
                    <div key={artist.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-sm shrink-0">
                        {artist.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white line-clamp-1">{artist.name}</p>
                        <p className="text-[10px] text-zinc-400">{artist.genre || "Guest Star"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Ticket Selection & Checkout */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 sticky top-28 space-y-6 shadow-2xl">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-purple-400" />
                  Pilih Kategori Tiket
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Pilih kategori & jumlah tiket yang ingin kamu pesan</p>
              </div>

              {categories.length === 0 ? (
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-400">
                  Belum ada kategori tiket yang dibuka untuk event ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    const isSoldOut = cat.stock <= 0;

                    return (
                      <button
                        key={cat.id}
                        disabled={isSoldOut}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? "bg-purple-600/15 border-purple-500 shadow-md shadow-purple-500/10"
                            : isSoldOut
                            ? "bg-zinc-900/40 border-zinc-800/40 opacity-50 cursor-not-allowed"
                            : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-extrabold text-sm text-white">{cat.name}</span>
                            <span className="block text-[11px] text-zinc-400 mt-0.5">
                              Sisa Stok: <strong className={cat.stock > 10 ? "text-emerald-400" : "text-amber-400"}>{cat.stock} Tiket</strong>
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-extrabold text-base text-purple-300">
                              {formatRupiah(cat.price)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quantity Picker */}
              {selectedCategory && selectedCategory.stock > 0 && (
                <div className="pt-4 border-t border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">Jumlah Tiket</span>
                    <div className="flex items-center gap-3 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-sm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm w-6 text-center text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(selectedCategory.stock, quantity + 1))}
                        className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-semibold">Total Pembayaran</span>
                    <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400">
                      {formatRupiah(totalPrice)}
                    </span>
                  </div>

                  {/* Checkout CTA Button */}
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Lanjut ke Pembayaran QRIS
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
