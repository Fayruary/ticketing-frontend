"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Ticket, Mail, Lock, LogIn, AlertCircle, Shield, Sparkles, UserCheck } from "lucide-react";

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
        <h2 className="text-2xl font-extrabold text-white">Selamat Datang Kembali</h2>
        <p className="text-xs text-zinc-400">Masuk ke akun Pengguna, Admin, atau Petugas Event</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1.5">Alamat Email</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com / admin@example.com"
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1.5">Kata Sandi / Password</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
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

      {/* Role guidance info */}
      <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
        <p className="font-semibold text-zinc-300 flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5 text-purple-400" />
          Dukungan Semua Role Sistem:
        </p>
        <p>• <strong>User</strong>: Membeli tiket & melihat E-Ticket</p>
        <p>• <strong>Admin</strong>: Mengelola event, banner, & petugas</p>
        <p>• <strong>Petugas</strong>: Scan QR check-in & penjualan offline</p>
      </div>

      <div className="text-center text-xs text-zinc-400 pt-2 border-t border-zinc-800">
        Belum memiliki akun?{" "}
        <Link href="/register" className="font-bold text-purple-400 hover:underline">
          Daftar Pengguna Baru
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 bg-concert-gradient">
      <Suspense fallback={<div className="text-white">Memuat...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
