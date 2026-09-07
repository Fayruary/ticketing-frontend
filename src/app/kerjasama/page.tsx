"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getPackages, type CooperationPackage } from "@/services/packageService";
import { formatRupiah } from "@/lib/utils";
import {
  Handshake,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Zap,
  ShieldCheck,
  QrCode,
  Ticket,
  Calendar,
  MessageSquare
} from "lucide-react";

export default function KerjasamaPage() {
  const [packages, setPackages] = useState<CooperationPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultPackages = [
    {
      id: 1,
      name: "Paket Per Event",
      duration: "1 Event",
      price: 1500000,
      description: "Cocok untuk event tunggal / konser skala sedang dengan kebutuhan validasi tiket instan."
    },
    {
      id: 2,
      name: "Paket 1 Bulan",
      duration: "1 Bulan Unlimited",
      price: 3500000,
      description: "Ideal untuk Event Organizer yang menyelenggarakan beberapa konser dalam 1 bulan."
    },
    {
      id: 3,
      name: "Paket 3 Bulan",
      duration: "3 Bulan Unlimited",
      price: 8500000,
      description: "Pilihan terpopuler untuk festival musik dan tour konser berkala."
    },
    {
      id: 4,
      name: "Paket 6 Bulan",
      duration: "6 Bulan Exclusive",
      price: 15000000,
      description: "Kemitraan jangka panjang dengan dukungan penuh support tim teknis lapangan."
    }
  ];

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res: any = await getPackages().catch(() => []);
      const pkgs = Array.isArray(res) ? res : res?.data || [];
      setPackages(pkgs.length > 0 ? pkgs : defaultPackages);
    } catch {
      setPackages(defaultPackages);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsApp = (packageName: string) => {
    const phoneNumber = "6281234567890"; // WhatsApp Admin
    const text = `Halo Admin TixGoo UKK, saya Penyelenggara Event / Event Organizer bermaksud untuk mengajukan kerja sama penjualan tiket konser online.

Paket Pilihan: ${packageName}

Detail Event Kami:
- Nama Event: 
- Tanggal Event: 
- Lokasi / Venue: 
- Kapasitas Venue: 
- Kategori Tiket (Reguler/VIP/VVIP): 
- Rencana Harga Tiket: 
- Deskripsi Singkat: 

Mohon info proses verifikasi dan penerbitan event di platform TixGoo. Terima kasih!`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Header Hero */}
        <section className="relative overflow-hidden py-16 bg-concert-gradient border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-widest mb-6">
              <Handshake className="w-4 h-4" />
              <span>Program Kemitraan Event Organizer</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
              Jual Tiket Konsermu di <span className="text-gradient">Platform Kami</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto">
              Solusi lengkap penanganan ticketing online, pembayaran QRIS otomatis, e-ticket QR Code, scan petugas lapangan di venue, hingga penjualan offline OTS.
            </p>
          </div>
        </section>

        {/* Pricelist Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Paket Kerja Sama & Pricelist</h2>
            <p className="text-sm text-zinc-400">Pilih durasi kemitraan yang paling cocok untuk konser atau event organizer kamu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="glass-card p-6 rounded-3xl border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between space-y-6 relative group hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {pkg.duration}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
                    {pkg.name}
                  </h3>

                  <div className="pt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400">
                      {formatRupiah(pkg.price)}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {pkg.description || "Dapatkan semua fasilitas sistem manajemen tiket, validasi QR Code petugas, dan laporan analytics penjualan."}
                  </p>

                  {/* Feature Checklist */}
                  <ul className="pt-4 border-t border-zinc-800 space-y-2.5 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Sistem E-Ticket QR Code Instan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Integrasi QRIS Payment Gateway</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Akun Petugas Scan Check-in Venue</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Penjualan Tiket Offline On the Spot</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenWhatsApp(pkg.name)}
                  className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Hubungi Admin via WhatsApp
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-zinc-800 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Alur Kerja Sama Penyelenggara Event</h2>
              <p className="text-xs sm:text-sm text-zinc-400">Proses cepat dan praktis dari pendaftaran hingga tiket mulai dijual</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 font-extrabold flex items-center justify-center text-base">
                  1
                </div>
                <h4 className="font-bold text-white text-sm">Pilih Paket Pricelist</h4>
                <p className="text-xs text-zinc-400">Pilih durasi paket kerja sama yang diinginkan dari daftar pricelist.</p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 font-extrabold flex items-center justify-center text-base">
                  2
                </div>
                <h4 className="font-bold text-white text-sm">Diskusi via WhatsApp Admin</h4>
                <p className="text-xs text-zinc-400">Diskusi syarat, detail konser, venue, poster, dan kategori tiket dengan Admin.</p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-base">
                  3
                </div>
                <h4 className="font-bold text-white text-sm">Input Event Oleh Admin</h4>
                <p className="text-xs text-zinc-400">Setelah disetujui, Admin memasukkan event dan kategori tiket ke platform.</p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-base">
                  4
                </div>
                <h4 className="font-bold text-white text-sm">Tiket Siap Dijual!</h4>
                <p className="text-xs text-zinc-400">Pengguna langsung dapat membeli tiket dan petugas siap melakukan scan di venue.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
