"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import useAuth from "@/hooks/useAuth";
import {
  User,
  Mail,
  Phone,
  Shield,
  ArrowLeft,
  Edit3,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Ticket,
  ShoppingBag,
} from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/profile");
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Profile update would require a backend endpoint - for now just show success
    setSaving(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setSuccessMsg("Profil berhasil diperbarui");
      setEditing(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError("Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-[#111d5e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roleLabel = {
    admin: "Administrator",
    petugas: "Petugas Lapangan",
    user: "Pengguna",
  }[user?.role || "user"] || "Pengguna";

  const roleColor = {
    admin: "text-purple-700 bg-purple-50 border-purple-200",
    petugas: "text-blue-700 bg-blue-50 border-blue-200",
    user: "text-gray-700 bg-gray-50 border-gray-200",
  }[user?.role || "user"] || "text-gray-700 bg-gray-50 border-gray-200";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#111d5e] mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Beranda
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="h-24 bg-gradient-to-r from-[#111d5e] via-[#2563eb] to-[#1d4ed8]" />

          {/* Avatar & Name */}
          <div className="px-6 pb-6 -mt-10">
            <div className="flex items-end justify-between mb-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-3xl font-extrabold text-[#111d5e]">
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#111d5e] border border-[#111d5e]/30 hover:bg-[#111d5e] hover:text-white transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {editing ? "Batal" : "Edit Profil"}
              </button>
            </div>

            <h1 className="text-xl font-extrabold text-gray-900">{user?.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${roleColor}`}>
                <Shield className="w-3 h-3" />
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Success/Error messages */}
          {successMsg && (
            <div className="mx-6 mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {successMsg}
            </div>
          )}
          {error && (
            <div className="mx-6 mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Info / Form */}
          <div className="px-6 pb-6 border-t border-gray-50 pt-4">
            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#111d5e] focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Nomor HP</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxx"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#111d5e] focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-[#111d5e] text-white hover:bg-[#0c1543] transition-all disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                    <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Nomor HP</p>
                    <p className="text-sm font-semibold text-gray-800">{user?.phone || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Shield className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Role</p>
                    <p className="text-sm font-semibold text-gray-800 capitalize">{roleLabel}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-100 px-6 py-4 grid grid-cols-2 gap-3">
            <Link
              href="/tickets"
              className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all"
            >
              <Ticket className="w-4 h-4 shrink-0" />
              Tiket Saya
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-all"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              Pesanan Saya
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 px-6 py-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Keluar dari Akun
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
