"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QRCode from "@/components/tickets/QRCode";
import { getEventById, type Event } from "@/services/eventService";
import { getTicketCategoryById, type TicketCategory } from "@/services/ticketService";
import { createOrder, type Order } from "@/services/orderService";
import { createPayment, updatePaymentStatus } from "@/services/paymentService";
import { formatDate, formatRupiah } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  QrCode,
  ShieldCheck,
  Ticket,
  User,
  Mail,
  Phone,
  Sparkles,
  AlertCircle,
  CreditCard
} from "lucide-react";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const categoryId = searchParams.get("categoryId") || "";
  const qtyParam = searchParams.get("qty") || "1";
  const quantity = Math.max(1, parseInt(qtyParam, 10));

  const [event, setEvent] = useState<Event | null>(null);
  const [category, setCategory] = useState<TicketCategory | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Order & Payment State
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState<"form" | "qris" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer state for QRIS
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/checkout/${eventId}?categoryId=${categoryId}&qty=${quantity}`);
      return;
    }

    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }

    fetchDetails();
  }, [eventId, categoryId, user, isAuthenticated]);

  useEffect(() => {
    let timer: any;
    if (checkoutStep === "qris" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [checkoutStep, timeLeft]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [evtRes, catRes] = await Promise.all([
        getEventById(eventId),
        getTicketCategoryById(categoryId)
      ]);

      setEvent((evtRes as any)?.data || evtRes);
      setCategory((catRes as any)?.data || catRes);
    } catch (err: any) {
      console.error("Error loading checkout details:", err);
      setError(err.message || "Gagal memuat rincian pesanan");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrderAndPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    try {
      setSubmitting(true);
      setError(null);

      // 1. Create order
      const orderResponse: any = await createOrder({
        items: [
          {
            ticket_category_id: category.id,
            quantity: quantity
          }
        ] as any
      });

      const orderData = orderResponse?.data || orderResponse;
      setOrder(orderData);

      // 2. Create Payment
      const paymentResponse: any = await createPayment({
        order_id: orderData.id,
        payment_method: "qris"
      });

      const paymentData = paymentResponse?.data || paymentResponse;
      setPayment(paymentData);

      setCheckoutStep("qris");
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Gagal memproses pembuatan tagihan pesanan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateQRISPayment = async () => {
    if (!payment) return;

    try {
      setPaying(true);
      setError(null);

      await updatePaymentStatus(payment.id, "success");

      setCheckoutStep("success");
    } catch (err: any) {
      console.error("Payment simulation error:", err);
      setError(err.message || "Gagal memverifikasi pembayaran QRIS");
    } finally {
      setPaying(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-zinc-400">Menyiapkan pembayaran QRIS...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalPrice = category ? Number(category.price) * quantity : 0;
  const adminFee = 5000;
  const grandTotal = totalPrice + adminFee;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header Breadcrumb */}
        <div className="mb-6">
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Event
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Checkout Tiket Konser</h1>
          <p className="text-xs text-zinc-400 mt-1">Lengkapi data diri dan bayar menggunakan QRIS Payment Gateway</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: FORM DATA DIRI & ORDER SUMMARY */}
        {checkoutStep === "form" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleCreateOrderAndPayment} className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-800 space-y-6">
                <div className="border-b border-zinc-800 pb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" />
                  <h3 className="font-extrabold text-lg text-white">Data Pemesan Tiket</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">Nama Lengkap (Sesuai KTP/Pengunjung)</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama Pembeli"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                      <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">Alamat Email (Untuk Pengiriman E-Ticket)</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@domain.com"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">Nomor Handphone (WhatsApp)</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08123456789"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Data transaksi terlindungi dengan aman
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Membuat Order...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Lanjut ke Bayar QRIS
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4">
                <h3 className="font-extrabold text-base text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  Ringkasan Pesanan
                </h3>

                <div className="space-y-2 text-xs">
                  <p className="font-bold text-sm text-white">{event?.name}</p>
                  <p className="text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    {formatDate(event?.event_date)}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-300">
                    <span>Kategori Tiket</span>
                    <strong className="text-purple-300 uppercase">{category?.name}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Harga Satuan</span>
                    <span>{formatRupiah(category?.price)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Jumlah</span>
                    <span>{quantity} Tiket</span>
                  </div>
                  <div className="flex justify-between text-zinc-300 pt-2 border-t border-zinc-800/60">
                    <span>Subtotal Tiket</span>
                    <span>{formatRupiah(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Biaya Layanan System</span>
                    <span>{formatRupiah(adminFee)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Total Tagihan</span>
                  <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: QRIS PAYMENT GATEWAY DISPLAY */}
        {checkoutStep === "qris" && (
          <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl border border-purple-500/40 text-center space-y-6 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <QrCode className="w-4 h-4" />
              <span>Payment Gateway QRIS Aktif</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Pindai QRIS Untuk Membayar</h2>
              <p className="text-xs text-zinc-400">Gunakan GoPay, OVO, Dana, ShopeePay, LinkAja, atau Mobile Banking pilihanmu</p>
            </div>

            {/* Countdown timer */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
              <Clock className="w-4 h-4" />
              Selesaikan Pembayaran Dalam: <span className="font-mono text-sm">{formatTimer(timeLeft)}</span>
            </div>

            {/* QR Code Big Container */}
            <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
              <QRCode value={order?.invoice_code || "QRIS-PAYMENT-CODE"} size={200} />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">KODE INVOICE:</span>
                <span className="font-mono text-xs font-bold text-purple-300">{order?.invoice_code}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-sm">
              <span className="text-zinc-400 font-semibold">Total Nominal Pembayaran:</span>
              <span className="font-extrabold text-xl text-purple-300">{formatRupiah(grandTotal)}</span>
            </div>

            {/* Simulated Payment Action */}
            <div className="pt-2 space-y-3">
              <button
                onClick={handleSimulateQRISPayment}
                disabled={paying}
                className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {paying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memverifikasi Pembayaran...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Simulasi Bayar QRIS Instan (Konfirmasi)
                  </>
                )}
              </button>
              <p className="text-[11px] text-zinc-400">Tekan tombol simulasi di atas untuk menyelesaikan transaksi pembayaran QRIS.</p>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT SUCCESS & E-TICKET ISSUED */}
        {checkoutStep === "success" && (
          <div className="max-w-md mx-auto glass-panel p-8 rounded-3xl border border-emerald-500/40 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Pembayaran Berhasil!</h2>
              <p className="text-sm text-zinc-300">
                E-Ticket QR Code resmimu telah berhasil diterbitkan oleh sistem dan tersimpan di akunmu.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-zinc-400">No Invoice:</span>
                <span className="font-mono text-purple-300 font-bold">{order?.invoice_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Status Transaksi:</span>
                <span className="font-bold text-emerald-400 uppercase">LUNAS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Dibayar:</span>
                <span className="font-bold text-white">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Link
                href="/tickets"
                className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Ticket className="w-5 h-5" />
                Lihat E-Ticket Saya (Tiket Saya)
              </Link>
              <Link
                href="/"
                className="w-full py-3 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Kembali ke Beranda Konser
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
