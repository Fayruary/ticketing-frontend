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
  Music,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  Users,
} from "lucide-react";

const CONCERT_IMAGES = [
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80",
];

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
      <div className="min-h-screen flex flex-col bg-white text-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#111d5e] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-500">Memuat detail event...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-gray-900">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Tidak Ditemukan</h2>
          <p className="text-sm text-gray-500 mb-6">{error || "Event tidak tersedia atau telah dihapus."}</p>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-bold bg-[#111d5e] text-white hover:bg-[#0c1543] transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const posterUrl = event.poster && event.poster.startsWith("http")
    ? event.poster
    : CONCERT_IMAGES[Math.abs(event.name.length) % CONCERT_IMAGES.length];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Banner Hero */}
        <div className="relative h-72 sm:h-96 w-full bg-gray-900 overflow-hidden">
          <img src={posterUrl} alt={event.name} className="w-full h-full object-cover brightness-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

          <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-200 hover:text-white mb-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#111d5e]/80 text-white border border-white/20 uppercase backdrop-blur-sm">
                {event.genre || "Konser Musik"}
              </span>
              {event.city && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/90 text-amber-900 border border-amber-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.city}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
              {event.name}
            </h1>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Main Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Specs Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-gray-100 shadow-sm bg-white flex items-center gap-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#111d5e] shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase">Tanggal Event</span>
                  <p className="text-xs font-bold text-gray-900">{formatDate(event.event_date)}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-gray-100 shadow-sm bg-white flex items-center gap-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase">Waktu Mulai</span>
                  <p className="text-xs font-bold text-gray-900">{event.event_time ? `${event.event_time.slice(0, 5)} WIB` : "19:00 WIB"}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-gray-100 shadow-sm bg-white flex items-center gap-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase">Lokasi Venue</span>
                  <p className="text-xs font-bold text-gray-900 line-clamp-1">{event.venue || "Stadium Concert Hall"}</p>
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm bg-white space-y-4">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#111d5e]" />
                Tentang Event Ini
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {event.description || "Rasakan pengalaman event spektakuler dengan pencahayaan panggung kelas dunia dan tata suara luar biasa. Dapatkan tiket resmimu sekarang sebelum kehabisan kuota!"}
              </p>
              {event.capacity && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Kapasitas: <strong className="text-gray-700">{event.capacity?.toLocaleString("id-ID")} orang</strong></span>
                </div>
              )}
            </div>

            {/* Line-up Artists */}
            {artists.length > 0 && (
              <div className="p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm bg-white space-y-4">
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <Music className="w-5 h-5 text-[#111d5e]" />
                  Line Up Artist & Pengisi Acara
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {artists.map((artist) => (
                    <div key={artist.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3 hover:border-[#111d5e]/20 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-[#111d5e] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {artist.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 line-clamp-1">{artist.name}</p>
                        <p className="text-[10px] text-gray-500">{artist.genre || "Guest Star"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Info */}
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#111d5e] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#111d5e] mb-1">Pembelian Tiket Resmi & Aman</p>
                <p className="text-[11px] text-blue-700">Tiket yang dibeli akan diterbitkan sebagai E-Ticket QR Code resmi secara otomatis setelah pembayaran dikonfirmasi. Tunjukkan QR Code ke petugas saat check-in di venue.</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Ticket Selection & Checkout */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-gray-100 shadow-lg bg-white sticky top-28 space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#111d5e]" />
                  Pilih Kategori Tiket
                </h3>
                <p className="text-xs text-gray-500 mt-1">Pilih kategori & jumlah tiket yang ingin kamu pesan</p>
              </div>

              {categories.length === 0 ? (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center text-xs text-gray-500">
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
                            ? "bg-[#111d5e]/5 border-[#111d5e] shadow-md"
                            : isSoldOut
                            ? "bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed"
                            : "bg-white border-gray-200 hover:border-[#111d5e]/40 hover:shadow-sm"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-[#111d5e]" />
                        )}
                        <div className="flex items-center justify-between pr-6">
                          <div>
                            <span className="font-extrabold text-sm text-gray-900">{cat.name}</span>
                            <span className="block text-[11px] text-gray-500 mt-0.5">
                              Sisa: <strong className={cat.stock > 10 ? "text-emerald-600" : "text-amber-600"}>{cat.stock} Tiket</strong>
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-base text-[#111d5e]">
                              {formatRupiah(cat.price)}
                            </span>
                          </div>
                        </div>
                        {isSoldOut && (
                          <span className="absolute top-2 right-2 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">HABIS</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quantity Picker */}
              {selectedCategory && selectedCategory.stock > 0 && (
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">Jumlah Tiket</span>
                    <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-[#111d5e] hover:border-[#111d5e] flex items-center justify-center font-bold text-sm transition-all shadow-sm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm w-6 text-center text-gray-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(selectedCategory.stock, quantity + 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-[#111d5e] hover:border-[#111d5e] flex items-center justify-center font-bold text-sm transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-semibold">Total Pembayaran</span>
                    <span className="text-lg font-extrabold text-[#111d5e]">
                      {formatRupiah(totalPrice)}
                    </span>
                  </div>

                  {/* Checkout CTA Button */}
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full py-4 rounded-2xl font-bold text-sm bg-[#111d5e] hover:bg-[#0c1543] text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Lanjut ke Pembayaran
                  </button>

                  <p className="text-[10px] text-gray-400 text-center">
                    Pembayaran QRIS · E-Ticket QR Code otomatis diterbitkan
                  </p>
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
