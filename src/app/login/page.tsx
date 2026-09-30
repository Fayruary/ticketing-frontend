"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Mail, Lock, LogIn, AlertCircle, Sparkles, Zap, ShieldCheck, Ticket } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const redirectUrl = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const res = await login(email, password);
      const userRole = res.user?.role;

      if (userRole === "admin") {
        router.push("/admin");
      } else if (userRole === "petugas") {
        router.push("/petugas");
      } else {
        router.push(redirectUrl);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-purple-500/30 space-y-6 shadow-2xl">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all group mb-2">
          <img
            src="/logo-tix.png"
            alt="TixGoo Logo"
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>
        <Link href="/register" className="text-xs font-semibold text-[#111d5e] hover:underline">
          Daftar Akun
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
                Selamat Datang Kembali!
              </h2>
              <p className="text-xs text-gray-200 leading-relaxed">
                Masuk ke akunmu untuk mengakses E-Ticket, riwayat pemesanan, dan event seru favoritmu.
              </p>
            </div>
          </div>

          {/* KOLOM KANAN: Form Login */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto space-y-5">
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  Masuk ke Akun
                </h1>
                <p className="text-xs text-gray-500">
                  Masukkan email dan kata sandi yang terdaftar di TixGoo.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
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
                      placeholder="nama@email.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#111d5e] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kata Sandi</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#111d5e] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  id="login-submit-btn"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-[#111d5e] hover:bg-[#0c1543] text-white shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Masuk Sekarang
                    </>
                  )}
                </button>
              </form>

              {/* Fitur Keunggulan Platform (Menggantikan Kotak Role) */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                  <Ticket className="w-4 h-4 text-blue-600 mx-auto" />
                  <p className="text-[10px] font-bold text-gray-800">E-Ticket Instan</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                  <Zap className="w-4 h-4 text-blue-600 mx-auto" />
                  <p className="text-[10px] font-bold text-gray-800">QRIS Otomatis</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                  <ShieldCheck className="w-4 h-4 text-blue-600 mx-auto" />
                  <p className="text-[10px] font-bold text-gray-800">100% Verified</p>
                </div>
              </div>

              {/* Footer Register Link */}
              <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                Belum memiliki akun?{" "}
                <Link href="/register" className="font-bold text-[#111d5e] hover:underline">
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white text-xs font-semibold text-gray-500">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}