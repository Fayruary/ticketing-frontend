"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { registerUser } from "@/services/authService";
import {
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

interface AuthSliderProps {
  initialMode?: "login" | "register";
}

// Tombol mata: mata terbuka = sandi terlihat, mata silang = sandi tersembunyi
function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
    >
      {show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </button>
  );
}

const ICON_LEFT =
  "w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none";

const INPUT_BASE =
  "w-full py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#111d5e] focus:border-transparent transition-all";

export default function AuthSlider({ initialMode = "login" }: AuthSliderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const redirectUrl = searchParams.get("redirect") || "/";

  // Mode: "login" | "register"
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Sync mode with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.includes("register")) {
        setMode("register");
      } else {
        setMode("login");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Switch mode with smooth slide and URL push (tanpa reload / kedip)
  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    if (newMode === "register") {
      window.history.pushState(null, "", "/register");
    } else {
      window.history.pushState(null, "", "/login");
    }
  };

  // --- STATE LOGIN ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // --- STATE REGISTER ---
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  // --- SUBMIT LOGIN ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      setLoginError(null);

      const res = await login(loginEmail, loginPassword);
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
      setLoginError(err.message || "Email atau kata sandi salah. Silakan coba lagi.");
    } finally {
      setLoginLoading(false);
    }
  };

  // --- SUBMIT REGISTER ---
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      setRegError("Silakan setujui Syarat & Ketentuan TixGoo terlebih dahulu.");
      return;
    }

    if (regPassword !== regConfirm) {
      setRegError("Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("Kata sandi minimal harus terdiri dari 6 karakter.");
      return;
    }

    try {
      setRegLoading(true);
      setRegError(null);
      await registerUser({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });
      setRegSuccess(true);
      setTimeout(() => {
        setRegSuccess(false);
        switchMode("login");
      }, 1800);
    } catch (err: any) {
      console.error("Register failed:", err);
      setRegError(err.message || "Pendaftaran gagal. Silakan coba lagi.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleSocialAction = (provider: string) => {
    alert(`Layanan ${provider} sedang dalam tahap integrasi.`);
  };

  const isRegister = mode === "register";

  return (
    <div className="relative w-full min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* Sembunyikan scrollbar halaman (tetap bisa di-scroll), aktif hanya selama halaman ini tampil */}
      <style>{`
        html { scrollbar-width: none; -ms-overflow-style: none; }
        html::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ============================================================== */}
      {/* SISI ILUSTRASI: SLIDING PANEL (DESKTOP)                        */}
      {/* ============================================================== */}
      <div
        className={`hidden lg:block absolute top-0 bottom-0 left-0 w-1/2 h-full z-20 select-none transition-transform duration-700 ease-in-out ${
          isRegister ? "translate-x-full" : "translate-x-0"
        }`}
        style={{ willChange: "transform" }}
      >
        {/* Latar biru + lingkaran (di-clip di sini saja) */}
        <div className="absolute inset-0 overflow-hidden bg-[#2a4bb3]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -top-28 -right-28 w-[26rem] h-[26rem] rounded-full bg-[#4a6fe0]/45" />
            <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-[#4a6fe0]/25" />
            <div className="absolute -bottom-44 -left-28 w-[36rem] h-[36rem] rounded-full bg-[#1f3a96]/70" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-[#1f3a96]/40" />
          </div>

          <div className="relative z-10 h-full flex flex-col">
            <div className="relative flex-1 mx-24 mt-16 mb-12">
              <Image
                src="/illustrations/Music_festival-bro.svg"
                alt="Ilustrasi festival musik TixGoo"
                fill
                priority
                unoptimized
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>

        {/* Tepi melengkung kanan (login), melebar 2px keluar panel agar tidak ada celah */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={`pointer-events-none absolute top-0 bottom-0 -right-[2px] h-full w-[calc(7rem+2px)] fill-white transition-opacity duration-700 ease-in-out ${
            isRegister ? "opacity-0" : "opacity-100"
          }`}
        >
          <path d="M100 0 L62 0 C30 14 30 36 58 48 C88 61 92 84 55 100 L100 100 Z" />
        </svg>

        {/* Tepi melengkung kiri (register) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={`pointer-events-none absolute top-0 bottom-0 -left-[2px] h-full w-[calc(7rem+2px)] fill-white [transform:scaleX(-1)] transition-opacity duration-700 ease-in-out ${
            isRegister ? "opacity-100" : "opacity-0"
          }`}
        >
          <path d="M100 0 L62 0 C30 14 30 36 58 48 C88 61 92 84 55 100 L100 100 Z" />
        </svg>
      </div>

      {/* ============================================================== */}
      {/* SISI FORM: SLIDING FORM CONTAINER (DESKTOP & MOBILE)           */}
      {/* ============================================================== */}
      <div
        className={`[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full lg:w-1/2 min-h-screen flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14 xl:px-20 bg-white z-10 overflow-y-auto lg:absolute lg:top-0 lg:bottom-0 lg:right-0 lg:h-full transition-transform duration-700 ease-in-out ${
          isRegister ? "lg:-translate-x-full" : "lg:translate-x-0"
        }`}
        style={{ willChange: "transform" }}
      >
        <div className="w-full max-w-md mx-auto">
          {/* Logo TixGoo */}
          <div className="mb-6">
            <Link href="/" className="inline-block">
              <img
                src="/logo-tix.png"
                alt="TixGoo Logo"
                className="h-9 sm:h-10 w-auto object-contain hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>

          {/* Form Switcher Container with Smooth Slide & Fade */}
          <div className="relative">
            {/* ======================= */}
            {/* 1. TAMPILAN FORM LOGIN */}
            {/* ======================= */}
            <div
              className={`w-full transition-all duration-500 ease-in-out ${
                !isRegister
                  ? "opacity-100 translate-x-0 pointer-events-auto relative z-10"
                  : "opacity-0 -translate-x-10 pointer-events-none absolute inset-0 z-0 invisible"
              }`}
            >
              {/* Header */}
              <div className="space-y-1 mb-5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Masuk ke Akun
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Masukkan email dan kata sandi yang terdaftar di TixGoo.
                </p>
              </div>

              {/* Error Alert */}
              {loginError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Input Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className={ICON_LEFT} />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className={`${INPUT_BASE} pl-10 pr-4`}
                    />
                  </div>
                </div>

                {/* Input Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      Kata Sandi
                    </label>
                    <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                      Lupa sandi?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className={ICON_LEFT} />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${INPUT_BASE} pl-10 pr-10`}
                    />
                    <PasswordToggle
                      show={showLoginPassword}
                      onToggle={() => setShowLoginPassword(!showLoginPassword)}
                    />
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#111d5e] focus:ring-[#111d5e] border-gray-300"
                    />
                    <span className="text-xs text-gray-600">Ingat saya</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#111d5e] hover:bg-[#0c1543] active:scale-[0.99] text-white shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  {loginLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Masuk Sekarang</span>
                  )}
                </button>
              </form>

              {/* Divider sosial */}
              <div className="relative flex items-center justify-center pt-5 pb-3">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-xs text-gray-400 font-medium shrink-0 absolute top-1/2 mt-1 -translate-y-1/2">
                  atau masuk dengan
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialAction("Google")}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialAction("Facebook")}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>

              {/* Pindah ke register */}
              <div className="text-center text-xs sm:text-sm text-gray-500 pt-5">
                Belum memiliki akun?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-bold text-[#111d5e] hover:underline transition-colors cursor-pointer"
                >
                  Daftar Sekarang
                </button>
              </div>
            </div>

            {/* ========================== */}
            {/* 2. TAMPILAN FORM REGISTER  */}
            {/* ========================== */}
            <div
              className={`w-full transition-all duration-500 ease-in-out ${
                isRegister
                  ? "opacity-100 translate-x-0 pointer-events-auto relative z-10"
                  : "opacity-0 translate-x-10 pointer-events-none absolute inset-0 z-0 invisible"
              }`}
            >
              {/* Header */}
              <div className="space-y-1 mb-5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Daftar Akun Baru
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Isi data diri kamu untuk mulai memesan tiket di TixGoo.
                </p>
              </div>

              {/* Alerts */}
              {regError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">
                    Pendaftaran berhasil! Mengalihkan ke login...
                  </span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className={ICON_LEFT} />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Nama lengkap kamu"
                      className={`${INPUT_BASE} pl-10 pr-4`}
                    />
                  </div>
                </div>

                {/* Email & No HP Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <Mail className={ICON_LEFT} />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className={`${INPUT_BASE} pl-10 pr-4`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Nomor HP <span className="text-gray-400 font-normal">(Opsional)</span>
                    </label>
                    <div className="relative">
                      <Phone className={ICON_LEFT} />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className={`${INPUT_BASE} pl-10 pr-4`}
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className={ICON_LEFT} />
                      <input
                        type={showRegPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 6 karakter"
                        className={`${INPUT_BASE} pl-10 pr-10`}
                      />
                      <PasswordToggle
                        show={showRegPassword}
                        onToggle={() => setShowRegPassword(!showRegPassword)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Konfirmasi Sandi
                    </label>
                    <div className="relative">
                      <Lock className={ICON_LEFT} />
                      <input
                        type={showRegConfirm ? "text" : "password"}
                        required
                        minLength={6}
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        placeholder="Ulangi sandi"
                        className={`${INPUT_BASE} pl-10 pr-10`}
                      />
                      <PasswordToggle
                        show={showRegConfirm}
                        onToggle={() => setShowRegConfirm(!showRegConfirm)}
                      />
                    </div>
                  </div>
                </div>

                {/* Checkbox Syarat & Ketentuan */}
                <div className="pt-0.5">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-[#111d5e] focus:ring-[#111d5e] border-gray-300"
                    />
                    <span className="text-xs text-gray-600 leading-normal">
                      Saya setuju dengan{" "}
                      <Link href="/" className="font-semibold text-blue-600 hover:underline">
                        Syarat & Ketentuan
                      </Link>{" "}
                      serta{" "}
                      <Link href="/" className="font-semibold text-blue-600 hover:underline">
                        Kebijakan Privasi
                      </Link>{" "}
                      TixGoo.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={regLoading || regSuccess}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#111d5e] hover:bg-[#0c1543] active:scale-[0.99] text-white shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  {regLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mendaftar...</span>
                    </>
                  ) : (
                    <span>Daftar Sekarang</span>
                  )}
                </button>
              </form>

              {/* Divider sosial */}
              <div className="relative flex items-center justify-center pt-5 pb-3">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-xs text-gray-400 font-medium shrink-0 absolute top-1/2 mt-1 -translate-y-1/2">
                  atau daftar dengan
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialAction("Google")}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialAction("Facebook")}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>

              {/* Pindah ke login */}
              <div className="text-center text-xs sm:text-sm text-gray-500 pt-5">
                Sudah memiliki akun?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-bold text-[#111d5e] hover:underline transition-colors cursor-pointer"
                >
                  Masuk di Sini
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}