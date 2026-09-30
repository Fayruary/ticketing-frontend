"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { registerUser } from "@/services/authService";
import {
  Mail,
  Lock,
  User,
  Phone,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Kata sandi tidak cocok. Coba lagi.");
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await registerUser({ name, email, phone, password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.error("Register failed:", err);
      setError(err.message || "Pendaftaran gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans">
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-xl font-black tracking-tight text-[#111d5e] flex items-center">
            <span className="text-blue-600 mr-0.5">✦</span>Tix<span className="text-blue-500">Goo</span>
          </span>
        </Link>
        <Link href="/login" className="text-xs font-semibold text-[#111d5e] hover:underline">
          Sudah punya akun?
        </Link>
      </div>

      {/* Center Card Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">

          {/* KOLOM KIRI: Foto Maskot / Hero Banner */}
          <div className="lg:col-span-5 relative bg-[#111d5e] p-8 text-white hidden lg:flex flex-col justify-between overflow-hidden">
            {/* Background Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111d5e] via-[#111d5e]/30 to-transparent z-10" />

            {/* Gambar Maskot */}
            <Image
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop"
              alt="Maskot Concert TixGoo"
              fill
              priority
              unoptimized
              className="object-cover object-center opacity-75"
            />

            {/* Top Badge */}
            <div className="relative z-20">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>Official Event Platform</span>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="relative z-20 space-y-2">
              <h2 className="text-2xl font-black text-white leading-tight">
                Siap untuk Panggung Konser Impianmu?
              </h2>
              <p className="text-xs text-gray-200 leading-relaxed">
                Dapatkan e-ticket QR Code resmi dengan jaminan transaksi 100% aman dan praktis.
              </p>
            </div>
          </div>

          {/* KOLOM KANAN: Form Register */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto space-y-5">
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  Daftar Akun Baru
                </h1>
                <p className="text-xs text-gray-500">
                  Isi data diri kamu untuk membuka akses ribuan tiket event.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Pendaftaran berhasil! Mengarahkan ke halaman login...</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Nama */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama lengkap kamu"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#111d5e] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#111d5e] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nomor HP <span className="text-gray-400 font-normal">(Opsional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxx"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#111d5e] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Kata Sandi</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 karakter"
                        minLength={6}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#111d5e] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Konfirmasi Sandi</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Ulangi sandi"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#111d5e] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || success}
                  id="register-submit-btn"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-[#111d5e] hover:bg-[#0c1543] text-white shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Mendaftar...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Daftar Sekarang
                    </>
                  )}
                </button>
              </form>

              <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-bold text-[#111d5e] hover:underline">
                  Masuk di Sini
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}