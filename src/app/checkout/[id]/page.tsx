"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TicketCard from "@/components/tickets/TicketCard"; // sesuaikan path jika berbeda
import { getEventById, type Event } from "@/services/eventService";
import { getTicketCategories, type TicketCategory } from "@/services/ticketService";
import {
  createCheckoutOrder,
  getOrderStatus,
  simulatePayment,
  getOrderETickets,
  type Order,
  type IssuedTicket,
  type TicketHolder
} from "@/services/orderService";
import { formatDate, formatRupiah } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Ticket,
  User,
  Mail,
  Phone,
  AlertCircle,
  CreditCard,
  Plus,
  Minus,
  ShoppingBag,
  Printer,
  Calendar,
  MapPin,
  Users,
  RefreshCw,
  Lock,
  ChevronRight,
  Check,
  X,
  Eye
} from "lucide-react";

declare global {
  interface Window {
    snap?: any;
  }
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  // Query parameter pre-selection
  const initialCatId = searchParams.get("categoryId") || "";
  const initialQty = parseInt(searchParams.get("qty") || "1", 10);

  // Data event & categories
  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stepper State: 1 = Kategori, 2 = Detail Pemesanan, 3 = Pembayaran Midtrans, 4 = E-Ticket
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // STEP 1 STATE: Selected Quantities per Category { [categoryId]: quantity }
  const [selectedItems, setSelectedItems] = useState<{ [categoryId: string]: number }>({});

  // STEP 2 STATE: Buyer Info & Individual Ticket Holders
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [useBuyerForFirstTicket, setUseBuyerForFirstTicket] = useState(true);
  const [ticketHolders, setTicketHolders] = useState<TicketHolder[]>([]);

  // STEP 3 & 4 STATE: Order, Payment & E-Tickets
  const [order, setOrder] = useState<Order | null>(null);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [issuedTickets, setIssuedTickets] = useState<IssuedTicket[]>([]);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Pratinjau cetak E-Ticket
  const [showPreview, setShowPreview] = useState(false);

  // Load Event and Categories
  useEffect(() => {
    fetchInitialData();
  }, [eventId]);

  // Autofill user profile when available
  useEffect(() => {
    if (user) {
      if (!buyerName) setBuyerName(user.name || "");
      if (!buyerEmail) setBuyerEmail(user.email || "");
      if (!buyerPhone) setBuyerPhone(user.phone || "");
    }
  }, [user]);

  // Pratinjau: kunci scroll halaman & tutup dengan tombol Esc
  useEffect(() => {
    if (!showPreview) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPreview(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showPreview]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [evtRes, catRes] = await Promise.all([
        getEventById(eventId),
        getTicketCategories(eventId)
      ]);

      const eventData = (evtRes as any)?.data || evtRes;
      const catsData: TicketCategory[] = Array.isArray(catRes) ? catRes : (catRes as any)?.data || [];

      setEvent(eventData);
      setCategories(catsData);

      // Pre-select category from query param if available
      if (initialCatId && catsData.some((c) => c.id === initialCatId)) {
        const found = catsData.find((c) => c.id === initialCatId);
        const maxQty = Math.min(found?.stock || 1, initialQty || 1);
        setSelectedItems({ [initialCatId]: maxQty });
      }
    } catch (err: any) {
      console.error("Error loading checkout data:", err);
      setError(err.message || "Gagal memuat informasi event dan kategori tiket.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 1 LOGIC: Category Counters & Calculations ---
  const handleQuantityChange = (catId: string, delta: number) => {
    const category = categories.find((c) => c.id === catId);
    if (!category) return;

    const currentQty = selectedItems[catId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    const maxStock = category.stock;
    const maxPerOrder = category.max_per_transaction || 5;
    const limit = Math.min(maxStock, maxPerOrder);

    if (newQty > limit) {
      alert(`Maksimal pembelian untuk kategori ${category.name} adalah ${limit} tiket.`);
      return;
    }

    setSelectedItems((prev) => {
      const updated = { ...prev };
      if (newQty === 0) {
        delete updated[catId];
      } else {
        updated[catId] = newQty;
      }
      return updated;
    });
  };

  // Hitung total paket, total tiket fisik (termasuk bundling), subtotal
  const totalPackages = Object.values(selectedItems).reduce((sum, q) => sum + q, 0);

  const totalPhysicalTickets = Object.entries(selectedItems).reduce((sum, [catId, qty]) => {
    const cat = categories.find((c) => c.id === catId);
    const bundleSize = cat?.tickets_per_package || 1;
    return sum + qty * bundleSize;
  }, 0);

  const subtotal = Object.entries(selectedItems).reduce((sum, [catId, qty]) => {
    const cat = categories.find((c) => c.id === catId);
    return sum + (Number(cat?.price) || 0) * qty;
  }, 0);

  const adminFee = totalPackages > 0 ? 5000 : 0;
  const grandTotal = subtotal + adminFee;

  // Sync Ticket Holders array when switching to Step 2
  const handleProceedToStep2 = () => {
    if (totalPackages === 0) {
      alert("Silakan pilih minimal satu kategori tiket untuk melanjutkan.");
      return;
    }

    // Bangun slot tiket fisik untuk masing-masing pemegang tiket
    const newHolders: TicketHolder[] = [];
    let idx = 1;

    Object.entries(selectedItems).forEach(([catId, qty]) => {
      const cat = categories.find((c) => c.id === catId);
      const bundleSize = cat?.tickets_per_package || 1;
      const count = qty * bundleSize;

      for (let i = 0; i < count; i++) {
        // Cek apakah data holder indeks ini sudah pernah diisi
        const existing = ticketHolders[idx - 1];
        newHolders.push({
          ticket_category_id: catId,
          ticket_index: idx,
          category_name: cat?.name || "Tiket",
          name: existing?.name || (idx === 1 && useBuyerForFirstTicket ? buyerName : ""),
          email: existing?.email || (idx === 1 && useBuyerForFirstTicket ? buyerEmail : ""),
          phone: existing?.phone || (idx === 1 && useBuyerForFirstTicket ? buyerPhone : "")
        });
        idx++;
      }
    });

    setTicketHolders(newHolders);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Update specific ticket holder field
  const handleHolderChange = (index: number, field: keyof TicketHolder, value: string) => {
    setTicketHolders((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Sync first ticket holder if toggle active
  useEffect(() => {
    if (useBuyerForFirstTicket && ticketHolders.length > 0) {
      setTicketHolders((prev) => {
        const copy = [...prev];
        copy[0] = {
          ...copy[0],
          name: buyerName,
          email: buyerEmail,
          phone: buyerPhone
        };
        return copy;
      });
    }
  }, [useBuyerForFirstTicket, buyerName, buyerEmail, buyerPhone]);

  // --- STEP 2 -> STEP 3: Create Order & Initialize Midtrans Snap ---
  const handleProceedToStep3 = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi data pemesan
    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      alert("Lengkapi nama lengkap, alamat email, dan nomor WhatsApp pemesan.");
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyerEmail.trim())) {
      alert("Format alamat email pemesan tidak valid.");
      return;
    }

    // Validasi nomor telepon
    if (buyerPhone.trim().length < 9) {
      alert("Nomor WhatsApp/telepon minimal 9 digit.");
      return;
    }

    // Validasi nama setiap pemegang tiket
    for (let i = 0; i < ticketHolders.length; i++) {
      if (!ticketHolders[i].name?.trim()) {
        alert(`Harap isi nama lengkap untuk Tiket #${i + 1} (${ticketHolders[i].category_name}).`);
        return;
      }
    }

    try {
      setSubmittingOrder(true);
      setError(null);

      // Siapkan items payload
      const itemsPayload = Object.entries(selectedItems).map(([catId, qty]) => ({
        ticket_category_id: catId,
        quantity: qty
      }));

      // Kirim ke backend
      const res: any = await createCheckoutOrder({
        event_id: eventId,
        buyer_name: buyerName.trim(),
        buyer_email: buyerEmail.trim(),
        buyer_phone: buyerPhone.trim(),
        items: itemsPayload,
        ticket_holders: ticketHolders
      });

      console.log("createCheckoutOrder response:", res);

      const orderData = res?.order || res?.data?.order || res;
      const token = res?.snap_token || res?.data?.snap_token;

      if (!orderData || (!orderData.id && !orderData.invoice_code)) {
        throw new Error(res?.message || "Gagal membuat tagihan pesanan. Silakan periksa kembali formulir.");
      }

      setOrder(orderData);
      setSnapToken(token);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Error creating order:", err);
      setError(err.message || "Gagal membuat tagihan pesanan. Silakan periksa kembali kuota tiket.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  // --- STEP 3 LOGIC: Midtrans Snap Payment Trigger ---
  const handleOpenMidtransSnap = () => {
    if (!snapToken) {
      alert("Token transaksi Midtrans belum siap. Silakan ulangi pemesanan.");
      return;
    }

    // Jika masih menggunakan fallback DEMO-SNAP (karena Server Key di .env belum diisi Server Key aktif)
    if (snapToken.startsWith("DEMO-SNAP-")) {
      const confirmSim = confirm(
        "Kunci Server Key di .env backend belum terhubung ke Midtrans Sandbox resmi (masih menggunakan demo token).\n\nIngin langsung jalankan Simulasi Pembayaran Sukses untuk demonstrasi UKK dan menerbitkan E-Ticket QR Code sekarang?"
      );
      if (confirmSim) {
        handleSimulatePaymentDemo();
      }
      return;
    }

    // Cek apakah script Midtrans Snap sudah dimuat di window
    if (typeof window !== "undefined" && window.snap) {
      window.snap.pay(snapToken, {
        onSuccess: async function (result: any) {
          console.log("Midtrans payment success:", result);
          setPaymentSuccess(true);
          await handleCheckPaymentSuccess(order?.id || result?.order_id || order?.invoice_code);
        },
        onPending: async function (result: any) {
          console.log("Midtrans payment pending:", result);
          alert("Pembayaran Anda sedang menunggu penyelesaian di Midtrans Sandbox.");
          await handleCheckPaymentSuccess(order?.id || result?.order_id || order?.invoice_code);
        },
        onError: function (result: any) {
          console.error("Midtrans payment error:", result);
          alert("Pembayaran gagal atau dibatalkan oleh sistem Midtrans.");
        },
        onClose: function () {
          console.log("Customer closed the Snap popup without finishing the payment");
        }
      });
    } else {
      // Fallback jika popup snap blocked / script belum loaded
      alert("Memuat Snap Gateway... Jika popup tidak terbuka, Anda dapat menggunakan tombol Simulasi Sandbox di bawah.");
    }
  };

  // Verifikasi status pembayaran dan ambil E-Tickets
  const handleCheckPaymentSuccess = async (orderIdentifier?: string) => {
    const idToQuery = orderIdentifier || order?.id || order?.invoice_code;
    if (!idToQuery) return;

    try {
      setVerifyingPayment(true);
      const res: any = await getOrderStatus(idToQuery);
      const fetchedOrder = res?.order || res?.data?.order;

      if (fetchedOrder && (fetchedOrder.status === "paid" || fetchedOrder.payment_status === "settlement")) {
        // Ambil tiket resmi
        const eTicketRes: any = await getOrderETickets(idToQuery);
        const tickets = eTicketRes?.tickets || eTicketRes?.data?.tickets || [];
        const ord = eTicketRes?.order || eTicketRes?.data?.order || fetchedOrder;
        setOrder(ord);
        setIssuedTickets(tickets);
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert("Pembayaran belum terkonfirmasi sebagai lunas oleh backend. Silakan coba kembali sesaat lagi.");
      }
    } catch (err: any) {
      console.error("Check status error:", err);
    } finally {
      setVerifyingPayment(false);
    }
  };

  // Simulasi Pembayaran Midtrans Sandbox untuk Demo UKK
  const handleSimulatePaymentDemo = async () => {
    const idToQuery = order?.id || order?.invoice_code;
    if (!idToQuery) {
      alert("ID Pesanan tidak ditemukan. Harap ulangi pemesanan.");
      return;
    }

    try {
      setVerifyingPayment(true);
      setError(null);

      const simRes: any = await simulatePayment(idToQuery);
      console.log("Simulate payment success:", simRes);

      // Ambil E-Ticket yang baru saja diterbitkan oleh backend
      const eTicketRes: any = await getOrderETickets(idToQuery);
      const tickets = eTicketRes?.tickets || eTicketRes?.data?.tickets || simRes?.tickets || simRes?.data?.tickets || [];
      const ord = eTicketRes?.order || eTicketRes?.data?.order;
      if (ord) setOrder(ord);
      setIssuedTickets(tickets);
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Simulation error:", err);
      setError(err.message || "Gagal memproses simulasi pembayaran Sandbox.");
    } finally {
      setVerifyingPayment(false);
    }
  };

  // --- STEP 4 LOGIC: Pratinjau & Cetak / Unduh E-Ticket ---
  const handleOpenPreview = () => setShowPreview(true);
  const handleClosePreview = () => setShowPreview(false);

  // Cetak / simpan PDF: tetap memakai dialog cetak bawaan browser
  const handlePrintTickets = () => {
    window.print();
  };

  // Data tiket untuk TicketCard (dipakai di daftar E-Ticket dan di pratinjau)
  const buildCardTicket = (tkt: any) => ({
    ...tkt,
    event_name: tkt.event_name || event?.name,
    event_date: tkt.event_date || event?.event_date,
    venue: tkt.venue || event?.venue || event?.city,
    ticket_category: tkt.ticket_category || tkt.category_name,
    owner_name: tkt.owner_name || order?.buyer_name || buyerName,
    status: tkt.status || "active"
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <div className="w-10 h-10 border-4 border-[#111d5e] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-gray-600">Memuat rincian event & tiket...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Terjadi Kesalahan</h2>
          <p className="text-xs text-gray-500 mb-6">{error}</p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-[#111d5e] text-white text-xs font-bold hover:bg-[#0c1543] transition-all"
          >
            Kembali ke Beranda
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-L5k1x8Y4nQz0mP2v-DEMO";

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Saat dicetak, hanya E-Ticket yang tampil (navbar & footer disembunyikan) */}
      <style>{`
        @media print {
          header, nav, footer { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <Navbar />

      {/* Script Midtrans Snap Sandbox */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={clientKey}
        strategy="lazyOnload"
      />

      {/* Saat pratinjau terbuka, isi halaman disembunyikan dari hasil cetak */}
      <main
        className={`flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full ${
          showPreview ? "print:hidden" : ""
        }`}
      >
        {/* ============================================================== */}
        {/* 1. HEADER INFORMASI EVENT (Banner, Judul, Tanggal, Venue)       */}
        {/* ============================================================== */}
        {event && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-sm mb-6 flex flex-col md:flex-row gap-6 items-start md:items-center print:hidden">
            {/* Event Poster Thumbnail */}
            <div className="w-full md:w-44 h-40 md:h-28 rounded-2xl overflow-hidden bg-gray-100 shrink-0 relative border border-gray-100">
              <img
                src={event.poster || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80"}
                alt={event.name}
                className="w-full h-full object-cover"
                onError={(e: any) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80";
                }}
              />
              {event.city && (
                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#111d5e]/90 text-white backdrop-blur-sm">
                  {event.city}
                </span>
              )}
            </div>

            {/* Event Meta Details */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                  {event.genre || "Konser Musik"}
                </span>
                <span className="text-xs text-gray-400 font-medium">·</span>
                <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Tiket Resmi Terverifikasi
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
                {event.name}
              </h1>

              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{formatDate(event.event_date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{event.event_time ? `${event.event_time.slice(0, 5)} WIB` : "19:00 WIB"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="line-clamp-1">{event.venue || event.city}</span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="self-stretch md:self-auto flex items-center justify-end">
              <Link
                href={`/events/${eventId}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#111d5e] bg-gray-50 hover:bg-gray-100 px-3.5 py-2 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Detail Event
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PROGRESS STEPPER (4 TAHAPAN UTAMA TIXGOO)                      */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm mb-8 print:hidden">
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { step: 1, label: "1. Kategori Tiket" },
              { step: 2, label: "2. Detail Pemesan" },
              { step: 3, label: "3. Pembayaran" },
              { step: 4, label: "4. E-Ticket" }
            ].map(({ step, label }) => {
              const isActive = currentStep === step;
              const isPassed = currentStep > step;

              return (
                <div
                  key={step}
                  onClick={() => {
                    if (step < currentStep && currentStep !== 4) {
                      setCurrentStep(step as 1 | 2 | 3 | 4);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={`flex flex-col items-center ${
                    step < currentStep && currentStep !== 4 ? "cursor-pointer hover:opacity-80 transition-opacity" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black transition-all mb-1.5 ${
                      isPassed
                        ? "bg-emerald-500 text-white shadow-sm"
                        : isActive
                        ? "bg-[#111d5e] text-white ring-4 ring-blue-100"
                        : "bg-gray-100 text-gray-400 font-semibold"
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : step}
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs tracking-tight transition-colors ${
                      isActive
                        ? "font-extrabold text-[#111d5e]"
                        : isPassed
                        ? "font-bold text-emerald-700"
                        : "font-medium text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert Global */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3 print:hidden">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 1: PILIH KATEGORI TIKET (Artatix UX Flow)                 */}
        {/* ============================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#111d5e]" />
                  Pilih Kategori Tiket
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tersedia tiket reguler, VIP, dan paket bundling hemat. Pilih kuantitas yang kamu inginkan.
                </p>
              </div>
              <div className="text-xs text-gray-500 font-semibold hidden sm:block">
                {categories.length} Kategori Tersedia
              </div>
            </div>

            {/* List Kategori Tiket Cards */}
            {categories.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-gray-200 text-center text-xs text-gray-500">
                Belum ada kategori tiket yang dibuka untuk event ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => {
                  const qty = selectedItems[cat.id] || 0;
                  const isSoldOut = cat.stock <= 0;
                  const isBundling = (cat.tickets_per_package || 1) > 1;
                  const itemTotal = Number(cat.price) * qty;

                  return (
                    <div
                      key={cat.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                        qty > 0
                          ? "bg-white border-[#111d5e] shadow-md ring-2 ring-blue-50"
                          : isSoldOut
                          ? "bg-gray-50/70 border-gray-200 opacity-60"
                          : "bg-white border-gray-200/90 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      {/* Top Header Card */}
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-extrabold text-base text-gray-900 leading-snug">
                            {cat.name}
                          </h3>
                          {isBundling && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                              Paket {cat.tickets_per_package} Tiket
                            </span>
                          )}
                          {isSoldOut && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                              Habis
                            </span>
                          )}
                        </div>

                        {/* Benefit / Deskripsi */}
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                          {cat.description || "Akses masuk resmi ke area panggung dengan tata suara & pencahayaan spektakuler."}
                        </p>
                      </div>

                      {/* Bottom Price & Counter Controls */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 font-semibold block">Harga per paket</span>
                          <span className="text-base sm:text-lg font-black text-[#111d5e]">
                            {formatRupiah(cat.price)}
                          </span>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            Sisa kuota: <strong className={cat.stock > 10 ? "text-emerald-600" : "text-amber-600"}>{cat.stock}</strong>
                          </span>
                        </div>

                        {/* Counter Plus Minus */}
                        {!isSoldOut ? (
                          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(cat.id, -1)}
                              disabled={qty === 0}
                              className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center justify-center font-bold transition-all disabled:opacity-40 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center font-black text-xs text-gray-900">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(cat.id, 1)}
                              disabled={qty >= cat.stock}
                              className="w-7 h-7 rounded-lg bg-[#111d5e] text-white hover:bg-[#0c1543] flex items-center justify-center font-bold transition-all disabled:opacity-40 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-bold">Sold Out</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sticky Bottom Order Summary Bar */}
            <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block">Total Pesanan</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg sm:text-xl font-black text-[#111d5e]">
                      {formatRupiah(grandTotal)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({totalPackages} paket · {totalPhysicalTickets} tiket fisik)
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToStep2}
                disabled={totalPackages === 0}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-[#111d5e] hover:bg-[#0c1543] text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>Lanjutkan ke Data Pemesan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: DETAIL PEMESANAN (Formulir Pemesan & Pemilik Tiket)     */}
        {/* ============================================================== */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <form onSubmit={handleProceedToStep3} className="lg:col-span-7 space-y-6">
              {/* Bagian 1: Data Pemesan Utama */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-sm space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#111d5e]" />
                    Informasi Data Pemesan
                  </h2>
                  <span className="text-[11px] font-semibold text-gray-400">Kontak Pengiriman</span>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nama Lengkap Pemesan <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111d5e] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Alamat Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111d5e] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nomor WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="tel"
                          required
                          value={buyerPhone}
                          onChange={(e) => setBuyerPhone(e.target.value)}
                          placeholder="08xxxxxxxxxx"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111d5e] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkbox auto-fill tiket pertama */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useBuyerForFirstTicket}
                      onChange={(e) => setUseBuyerForFirstTicket(e.target.checked)}
                      className="w-4 h-4 rounded text-[#111d5e] focus:ring-[#111d5e] border-gray-300"
                    />
                    <span className="text-xs text-gray-600 font-medium">
                      Gunakan data pemesan untuk pemilik Tiket #1
                    </span>
                  </label>
                </div>
              </div>

              {/* Bagian 2: Data Pemilik Masing-Masing Tiket */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-sm space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#111d5e]" />
                      Data Pemilik Tiket ({totalPhysicalTickets} Pengunjung)
                    </h2>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Nama pada masing-masing tiket akan tercetak langsung pada E-Ticket QR Code.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {ticketHolders.map((holder, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#111d5e]">
                          Tiket #{idx + 1} · {holder.category_name}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                          Pengunjung #{idx + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Nama Lengkap Pengunjung <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={holder.name || ""}
                            onChange={(e) => handleHolderChange(idx, "name", e.target.value)}
                            placeholder="Nama sesuai identitas"
                            className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#111d5e] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Email Pengunjung <span className="text-gray-400 font-normal">(Opsional)</span>
                          </label>
                          <input
                            type="email"
                            value={holder.email || ""}
                            onChange={(e) => handleHolderChange(idx, "email", e.target.value)}
                            placeholder="email@example.com"
                            className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#111d5e] transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tombol Navigasi Step 2 */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Ubah Kategori Tiket
                </button>

                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="px-8 py-3.5 rounded-xl bg-[#111d5e] hover:bg-[#0c1543] text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submittingOrder ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyiapkan Midtrans...</span>
                    </>
                  ) : (
                    <>
                      <span>Lanjut ke Pembayaran</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Sidebar Order Summary */}
            <div className="lg:col-span-5 space-y-4 sticky top-24">
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#111d5e]" />
                  Ringkasan Pesanan
                </h3>

                {/* Items Breakdown */}
                <div className="space-y-2.5">
                  {Object.entries(selectedItems).map(([catId, qty]) => {
                    const cat = categories.find((c) => c.id === catId);
                    if (!cat) return null;
                    const bundleSize = cat.tickets_per_package || 1;

                    return (
                      <div key={catId} className="flex items-start justify-between text-xs">
                        <div>
                          <p className="font-bold text-gray-900">{cat.name}</p>
                          <p className="text-[11px] text-gray-500">
                            {qty} paket × {formatRupiah(cat.price)}
                            {bundleSize > 1 && ` (${qty * bundleSize} tiket)`}
                          </p>
                        </div>
                        <span className="font-extrabold text-gray-900">
                          {formatRupiah(Number(cat.price) * qty)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal Tiket</span>
                    <span className="font-bold">{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Biaya Layanan Platform</span>
                    <span className="font-bold">{formatRupiah(adminFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-100 text-gray-900">
                    <span className="font-black">Total Pembayaran</span>
                    <span className="font-black text-[#111d5e] text-base">
                      {formatRupiah(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: METODE PEMBAYARAN MIDTRANS SANDBOX SNAP                */}
        {/* ============================================================== */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#111d5e] mx-auto shadow-sm">
                <CreditCard className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Selesaikan Pembayaran Anda
                </h2>
                <p className="text-xs text-gray-500">
                  Pesanan tagihan <strong className="text-gray-800">{order?.invoice_code || "INV-TAGIHAN"}</strong> siap dibayar via Midtrans Sandbox Snap Gateway.
                </p>
              </div>

              {/* Total Tagihan Box */}
              <div className="p-4 rounded-2xl bg-[#111d5e]/5 border border-[#111d5e]/20 max-w-sm mx-auto">
                <span className="text-[11px] font-bold text-gray-500 block">TOTAL TAGIHAN</span>
                <span className="text-2xl sm:text-3xl font-black text-[#111d5e]">
                  {formatRupiah(order?.total || grandTotal)}
                </span>
                <span className="text-[11px] text-gray-500 block mt-1">
                  {totalPhysicalTickets} Tiket Fisik · {buyerName}
                </span>
              </div>

              {/* Supported Midtrans Payment Channels */}
              <div className="space-y-3 pt-2 text-left bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200/80">
                <span className="text-xs font-black text-gray-800 block">
                  Metode Pembayaran Tersedia (Midtrans Sandbox):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] font-bold text-gray-700">
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                    QRIS Instan
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                    BCA / Mandiri VA
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                    BNI / BRI VA
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                    Kartu Kredit Demo
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 text-center pt-1">
                  Terintegrasi langsung dengan Snap API resmi Midtrans Sandbox.
                </p>
              </div>

              {/* Main Pay with Midtrans Button */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleOpenMidtransSnap}
                  className="w-full py-4 rounded-2xl font-black text-sm bg-[#111d5e] hover:bg-[#0c1543] text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Buka Pembayaran Midtrans Snap</span>
                </button>

                {/* Simulator Option for Sandbox Demo */}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Mode Pengujian / Demonstrasi UKK:
                  </span>
                  <button
                    type="button"
                    onClick={handleSimulatePaymentDemo}
                    disabled={verifyingPayment}
                    className="w-full py-3 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {verifyingPayment ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Memverifikasi Pembayaran...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simulasikan Pembayaran Berhasil (Sandbox Simulator)</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400">
                    Gunakan simulasi ini untuk langsung memverifikasi transaksi dan menerbitkan E-Ticket QR Code tanpa memerlukan tunnel webhook eksternal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: HASIL TRANSAKSI DAN E-TICKET                            */}
        {/* ============================================================== */}
        {currentStep === 4 && (
          <div className="space-y-8">
            {/* Success Confirmation Banner */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm px-6 py-8 sm:px-10 sm:py-10 text-center print:hidden">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <p className="mt-5 text-sm font-semibold text-emerald-700">Pembayaran Terverifikasi</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Transaksi Berhasil! E-Ticket Siap
              </h2>
              <p className="mt-3 text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                Terima kasih, <strong className="text-gray-800">{order?.buyer_name || buyerName}</strong>. E-Ticket resmi kamu telah berhasil diterbitkan oleh sistem TixGoo.
              </p>

              {/* Ringkasan transaksi: informasi, dipisah garis tipis */}
              <dl className="mt-8 mx-auto max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-y-5 text-center">
                <div className="sm:px-4 sm:border-l sm:first:border-l-0 border-gray-200">
                  <dt className="text-xs text-gray-500">Invoice</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900 break-all">
                    {order?.invoice_code || "INV-CONFIRMED"}
                  </dd>
                </div>
                <div className="sm:px-4 sm:border-l sm:first:border-l-0 border-gray-200">
                  <dt className="text-xs text-gray-500">Total</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900 tabular-nums">
                    {formatRupiah(order?.total || grandTotal)}
                  </dd>
                </div>
                <div className="sm:px-4 sm:border-l sm:first:border-l-0 border-gray-200">
                  <dt className="text-xs text-gray-500">Status</dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Lunas
                  </dd>
                </div>
              </dl>

              {/* Aksi */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenPreview}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 sm:w-72 rounded-xl bg-[#111d5e] hover:bg-[#0c1543] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111d5e] focus-visible:ring-offset-2"
                >
                  <Printer className="w-4 h-4" /> Cetak / Unduh Detail Invoice
                </button>

                <Link
                  href="/tickets"
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 sm:w-72 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors"
                >
                  <Ticket className="w-4 h-4" /> Lihat di Tiket Saya
                </Link>
              </div>

              <Link
                href="/"
                className="mt-5 inline-block text-sm font-medium text-gray-500 hover:text-[#111d5e] hover:underline underline-offset-4 transition-colors"
              >
                Kembali ke Beranda
              </Link>
            </div>

            {/* E-TICKETS: memakai TicketCard yang sama dengan halaman Tiket Saya */}
            <div className="space-y-5">
              <div className="flex items-center justify-between print:hidden">
                <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#111d5e]" />
                  Daftar E-Ticket Konser Resmi ({issuedTickets.length} Tiket)
                </h3>
                <span className="text-xs text-gray-500 font-medium hidden sm:block">
                  Tunjukkan QR Code berikut ke petugas pintu masuk konser.
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 print:gap-4">
                {issuedTickets.map((tkt: any, idx) => (
                  <TicketCard
                    key={tkt.id || idx}
                    ticket={buildCardTicket(tkt)}
                    buyerName={order?.buyer_name || buyerName}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* ============================================================== */}
      {/* PRATINJAU CETAK / UNDUH E-TICKET                                */}
      {/* Layar: modal dengan lembar kertas. Cetak: hanya lembar kertas.  */}
      {/* ============================================================== */}
      {showPreview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau E-Ticket"
          className="fixed inset-0 z-[100] flex flex-col bg-slate-900/70 backdrop-blur-sm print:static print:block print:bg-white print:backdrop-blur-none"
        >
          {/* Toolbar (tidak ikut tercetak) */}
          <div className="shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-[#111d5e] flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight">
                  Pratinjau E-Ticket
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                  {issuedTickets.length} tiket · {order?.invoice_code || "INV-CONFIRMED"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClosePreview}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-3 sm:px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Tutup</span>
              </button>
              <button
                type="button"
                onClick={handlePrintTickets}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 sm:px-5 rounded-xl bg-[#111d5e] hover:bg-[#0c1543] text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111d5e] focus-visible:ring-offset-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Unduh PDF</span>
              </button>
            </div>
          </div>

          {/* Area scroll pratinjau */}
          <div
            className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 sm:py-10 print:overflow-visible print:p-0"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClosePreview();
            }}
          >
            {/* Lembar kertas */}
            <div
              id="eticket-print-area"
              className="mx-auto w-full max-w-3xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-5 sm:p-10 print:max-w-none print:rounded-none print:shadow-none print:ring-0 print:p-0"
            >
              {/* Kop: logo + judul dokumen */}
              <div className="flex items-center justify-between gap-4 pb-5 border-b border-gray-200">
                <img
                  src="/logo-tix.png"
                  alt="TixGoo"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
                <div className="text-right">
                  <p className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight">
                    E-Ticket Resmi
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                    {issuedTickets.length} tiket
                  </p>
                </div>
              </div>

              {/* Informasi event */}
              {event && (
                <div className="py-5 sm:py-6">
                  <h3 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
                    {event.name}
                  </h3>

                  <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0">
                    <div className="sm:pr-4">
                      <dt className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" /> Tanggal
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900">
                        {formatDate(event.event_date)}
                      </dd>
                    </div>
                    <div className="sm:px-4 sm:border-l sm:border-gray-200">
                      <dt className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" /> Waktu
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900">
                        {event.event_time ? `${event.event_time.slice(0, 5)} WIB` : "19:00 WIB"}
                      </dd>
                    </div>
                    <div className="sm:pl-4 sm:border-l sm:border-gray-200">
                      <dt className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" /> Lokasi
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900">
                        {event.venue || event.city}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Ringkasan pesanan */}
              <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-4 sm:px-5">
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
                  <div>
                    <dt className="text-[11px] text-gray-500">Invoice</dt>
                    <dd className="mt-0.5 text-xs sm:text-sm font-semibold text-gray-900 break-all">
                      {order?.invoice_code || "INV-CONFIRMED"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-gray-500">Pemesan</dt>
                    <dd className="mt-0.5 text-xs sm:text-sm font-semibold text-gray-900 break-words">
                      {order?.buyer_name || buyerName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-gray-500">Total</dt>
                    <dd className="mt-0.5 text-xs sm:text-sm font-semibold text-gray-900 tabular-nums">
                      {formatRupiah(order?.total || grandTotal)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-gray-500">Status</dt>
                    <dd className="mt-0.5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Lunas
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Daftar tiket: satu tiket per baris, tidak terpotong antar halaman */}
              <div className="mt-6 sm:mt-8 space-y-5 print:space-y-4">
                {issuedTickets.map((tkt: any, idx) => (
                  <div key={tkt.id || idx} className="break-inside-avoid">
                    <TicketCard
                      ticket={buildCardTicket(tkt)}
                      buyerName={order?.buyer_name || buyerName}
                    />
                  </div>
                ))}
              </div>

              {/* Catatan kaki */}
              <div className="mt-6 sm:mt-8 pt-4 border-t border-gray-200 text-center">
                <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">
                  Tunjukkan QR Code pada setiap tiket kepada petugas di pintu masuk.
                  Satu QR Code hanya berlaku untuk satu kali masuk.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}