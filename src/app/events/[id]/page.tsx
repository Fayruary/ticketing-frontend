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
import {
  Calendar,
  MapPin,
  Ticket,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Building2,
  Info,
  FileText,
  UserCheck,
  Sparkles
} from "lucide-react";

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const artistData = Array.isArray(artistRes) ? artistRes : (artistRes as any)?.data || [];
      setArtists(artistData);
    } catch (err: any) {
      console.error("Error loading event detail:", err);
      setError(err.message || "Gagal memuat detail event");
    } finally {
      setLoading(false);
    }
  };

  // Kalkulasi harga tiket mulai dari
  const availableCategories = categories.filter((c) => c.stock > 0);
  const allSoldOut = categories.length > 0 && availableCategories.length === 0;
  const minPrice =
    availableCategories.length > 0
      ? Math.min(...availableCategories.map((c) => Number(c.price)))
      : categories.length > 0
        ? Math.min(...categories.map((c) => Number(c.price)))
        : 0;

  const handleProceedToTickets = () => {
    router.push(`/checkout/${id}?step=1`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-slate-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#111d5e] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Memuat detail konser...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-slate-900">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Event Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-md">
            {error || "Informasi event konser yang Anda tuju tidak tersedia atau telah diarsipkan."}
          </p>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-bold bg-[#111d5e] text-white hover:bg-[#0c1543] transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const posterUrl =
    event.poster && event.poster.startsWith("http")
      ? event.poster
      : event.poster
        ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"}/uploads/banners/${event.poster}`
        : FALLBACK_POSTER;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc] text-slate-900 antialiased">
      <Navbar />

      <main className="flex-1 pb-28 md:pb-16">
        {/* ========================================================= */}
        {/* HERO SECTION: Editorial Compact (Kiri: Poster, Kanan: Info) */}
        {/* ========================================================= */}
        <section className="bg-gradient-to-b from-slate-100/60 via-slate-50/30 to-transparent border-b border-slate-200/60 pt-6 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb navigasi */}
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
              <Link href="/" className="hover:text-[#111d5e] transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/events" className="hover:text-[#111d5e] transition-colors">
                Jadwal Konser
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-xs">
                {event.name}
              </span>
            </nav>

            {/* Komposisi Dua Kolom Seimbang: Poster Kiri, Informasi Kanan */}
            <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6 lg:gap-8">
              {/* Kolom Kiri: Poster Konser Proporsional (250-270px) */}
              <div className="w-[220px] sm:w-[250px] lg:w-[270px] shrink-0 aspect-[3/4] rounded-xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterUrl}
                  alt={event.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Kolom Kanan: Informasi Konser dengan Hierarki Jelas */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 space-y-4 text-center md:text-left">
                <div className="space-y-3">
                  {/* Status & Kategori Badges */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-50 text-[#111d5e] border border-blue-200/80">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      Official Concert
                    </span>
                    {allSoldOut ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-rose-50 text-rose-700 border border-rose-200">
                        Tiket Habis Terjual
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Tiket Tersedia
                      </span>
                    )}
                  </div>

                  {/* Headline Nama Konser */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111d5e] tracking-tight leading-tight">
                    {event.name}
                  </h1>
                </div>

                {/* Detail Jadwal & Lokasi */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-start justify-center md:justify-start gap-3 text-slate-700">
                    <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <span className="font-bold text-slate-900 block">
                        {formatDate(event.event_date)}
                      </span>
                      {event.event_time && (
                        <span className="text-xs text-slate-500">
                          Pukul {event.event_time} WIB
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start justify-center md:justify-start gap-3 text-slate-700">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <span className="font-bold text-slate-900 block line-clamp-1">
                        {event.venue}
                      </span>
                      <span className="text-xs text-slate-500">
                        {event.city || "Indonesia"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Penyelenggara */}
                {event.organizer_name && (
                  <div className="pt-2 flex items-center justify-center md:justify-start gap-2.5 text-xs text-slate-600 border-t border-slate-100/80">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Diselenggarakan oleh:{" "}
                      <strong className="font-semibold text-slate-900">
                        {event.organizer_name}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* MAIN BODY: Split 2 Kolom (Kiri: Editorial, Kanan: Sticky CTA) */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Kolom Kiri: Konten Editorial & Informasi Konser */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-10">
              {/* 1. Deskripsi Acara */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#111d5e] pb-3 border-b border-slate-200/80 flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Tentang Konser
                </h2>
                <div className="pt-4 text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line space-y-3">
                  {event.description ? (
                    event.description
                  ) : (
                    <p className="text-slate-500 italic">
                      Informasi lengkap mengenai jadwal penampilan dan rangkaian acara konser ini akan diperbarui secara berkala oleh pihak penyelenggara.
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Line-up Artis / Pengisi Acara */}
              {artists.length > 0 && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#111d5e] pb-3 border-b border-slate-200/80 flex items-center gap-2.5">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    Line-up & Pengisi Acara
                  </h2>
                  <div className="pt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {artists.map((artist) => (
                      <div
                        key={artist.id}
                        className="flex flex-col items-center text-center p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-slate-100 border border-slate-200 mb-3">
                          {artist.photo || artist.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={artist.photo || artist.image_url}
                              alt={artist.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-lg">
                              {artist.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {artist.name}
                        </h4>
                        {(artist.role || artist.genre) && (
                          <span className="text-[11px] text-slate-500 mt-1">
                            {artist.role || artist.genre}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Informasi Venue & Lokasi */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#111d5e] pb-3 border-b border-slate-200/80 flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-rose-500" />
                  Informasi Venue
                </h2>
                <div className="pt-4 text-sm sm:text-base text-slate-700 space-y-2">
                  <p className="font-bold text-slate-900">{event.venue}</p>
                  <p className="text-slate-600">
                    Kota {event.city || "Bandung"}, Indonesia
                  </p>
                  <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                    Pastikan Anda hadir minimal 60 menit sebelum gerbang venue dibuka untuk proses penukaran tiket dan pemeriksaan keamanan di pintu masuk.
                  </p>
                </div>
              </div>

              {/* 4. Ketentuan & Syarat Pembelian */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#111d5e] pb-3 border-b border-slate-200/80 flex items-center gap-2.5">
                  <Info className="w-5 h-5 text-amber-600" />
                  Syarat & Ketentuan Acara
                </h2>
                <ul className="pt-4 space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    <span>
                      Setiap transaksi pembelian tiket dibatasi sesuai dengan kuota maksimal yang telah ditentukan oleh pihak penyelenggara.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    <span>
                      E-Ticket resmi dilengkapi dengan Kode Tiket dan QR Code unik yang akan diverifikasi oleh petugas scanner saat proses check-in.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    <span>
                      Tiket yang telah dibeli tidak dapat ditukar atau dikembalikan (non-refundable), kecuali terdapat pembatalan resmi dari pihak promotor.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    <span>
                      Pengunjung wajib membawa kartu identitas sah (KTP / SIM / Paspor) yang sesuai dengan nama pada saat registrasi pembelian.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Kolom Kanan: Sticky Booking Action Panel (Tanpa List Kategori Tiket) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24 rounded-2xl bg-white border border-slate-200/90 shadow-sm p-6 space-y-6">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Harga Tiket Mulai Dari
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-[#111d5e]">
                      {categories.length > 0 ? formatRupiah(minPrice) : "Rp 0"}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ tiket</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium">Kategori Tiket:</span>
                    <span className="font-bold text-slate-900">
                      {categories.length} Kategori
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium">Status Ketersediaan:</span>
                    <span
                      className={`font-bold ${allSoldOut ? "text-rose-600" : "text-emerald-600"
                        }`}
                    >
                      {allSoldOut ? "Habis Terjual" : "Tersedia Sekarang"}
                    </span>
                  </div>
                </div>

                {/* Tombol Utama: Pilih Tiket */}
                <button
                  type="button"
                  onClick={handleProceedToTickets}
                  disabled={allSoldOut}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${allSoldOut
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-[#111d5e] hover:bg-[#0c1543] active:bg-[#0a1139] text-white hover:shadow-md"
                    }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>{allSoldOut ? "Tiket Habis" : "Pilih Kategori Tiket"}</span>
                  {!allSoldOut && <ChevronRight className="w-4 h-4" />}
                </button>

                <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                  Pilih kategori dan lengkapi data pengunjung pada langkah berikutnya.
                </p>

                {/* Point Keamanan & Jaminan Faktual */}
                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Pembayaran resmi via Midtrans Payment Gateway</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>E-Ticket QR Code resmi langsung diterbitkan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* MOBILE FLOATING ACTION BAR (< 768px)                       */}
      {/* ========================================================= */}
      <aside
        aria-label="Aksi pembelian tiket"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex items-center justify-between shadow-lg md:hidden"
      >
        <div>
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Mulai dari
          </span>
          <span className="text-lg font-black text-[#111d5e]">
            {categories.length > 0 ? formatRupiah(minPrice) : "Rp 0"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleProceedToTickets}
          disabled={allSoldOut}
          className={`py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm ${allSoldOut
            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-[#111d5e] hover:bg-[#0c1543] active:bg-[#0a1139] text-white"
            }`}
        >
          <span>{allSoldOut ? "Habis" : "Pilih Tiket"}</span>
          {!allSoldOut && <ChevronRight className="w-4 h-4" />}
        </button>
      </aside>

      <Footer />
    </div>
  );
}
