"use client";

import React, { useState } from "react";
import {
  QrCode,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  Search,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  Ticket as TicketIcon,
  RotateCcw,
  Sparkles,
  CreditCard,
  Mail,
  User,
} from "lucide-react";
import {
  checkinTicket,
  validateTicketCode,
  type TicketValidationResult,
  type CheckinResponse,
} from "@/services/checkinService";
import { formatDate } from "@/lib/utils";

interface PetugasCheckinTabProps {
  canCheckin: boolean;
  selectedEventId: string;
  onCheckinSuccess?: () => void;
}

export default function PetugasCheckinTab({
  canCheckin,
  selectedEventId,
  onCheckinSuccess,
}: PetugasCheckinTabProps) {
  const [ticketCodeInput, setTicketCodeInput] = useState("");
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [loadingCheckin, setLoadingCheckin] = useState(false);

  // Hasil validasi (cek status)
  const [validationResult, setValidationResult] = useState<TicketValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Hasil check-in langsung
  const [checkinResult, setCheckinResult] = useState<CheckinResponse | null>(null);
  const [checkinError, setCheckinError] = useState<string | null>(null);

  // Helper membersihkan input (jika copy paste atau scanner decode string JSON)
  const cleanInputCode = (raw: string): string => {
    let trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.code) return String(parsed.code).trim().toUpperCase();
        if (parsed.ticket_code) return String(parsed.ticket_code).trim().toUpperCase();
      } catch {
        // bukan JSON
      }
    }
    return trimmed.toUpperCase();
  };

  // 1. Validasi Kode Tiket (Cek apakah valid atau used tanpa langsung mengubah data)
  const handleValidateTicket = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = cleanInputCode(ticketCodeInput);
    if (!clean) return;

    try {
      setLoadingCheck(true);
      setValidationError(null);
      setCheckinResult(null);
      setCheckinError(null);

      const res = await validateTicketCode(clean);
      setValidationResult(res);
    } catch (err: any) {
      setValidationResult(null);
      setValidationError(
        err.message || `Kode tiket "${clean}" tidak ditemukan atau tidak valid dalam sistem.`
      );
    } finally {
      setLoadingCheck(false);
    }
  };

  // 2. Proses Check-in Masuk Venue
  const handleProcessCheckin = async (codeToUse?: string) => {
    const targetCode = cleanInputCode(codeToUse || ticketCodeInput);
    if (!targetCode) return;

    try {
      setLoadingCheckin(true);
      setCheckinError(null);

      const res = await checkinTicket(targetCode);
      setCheckinResult(res);

      // Perbarui juga status di validationResult jika ada
      if (validationResult && validationResult.ticket_code === targetCode) {
        setValidationResult({
          ...validationResult,
          status: "used",
          is_valid: false,
          status_label: "Sudah Digunakan (Telah Masuk)",
          checkin_time: new Date().toISOString(),
        });
      }

      if (onCheckinSuccess) {
        onCheckinSuccess();
      }
    } catch (err: any) {
      setCheckinError(
        err.message || "Gagal melakukan check-in. Pastikan tiket valid dan Anda memiliki akses pada event ini."
      );
    } finally {
      setLoadingCheckin(false);
    }
  };

  // Reset form untuk pengunjung berikutnya
  const handleReset = () => {
    setTicketCodeInput("");
    setValidationResult(null);
    setValidationError(null);
    setCheckinResult(null);
    setCheckinError(null);
  };

  if (!canCheckin) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-gray-200 text-center space-y-3 max-w-xl mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-gray-900 text-base">Akses Scan Check-in Dibatasi</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Akun Anda tidak memiliki izin <strong>checkin</strong> pada event ini. Hubungi Administrator untuk mengaktifkan izin scan tiket.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Box Input Kode Tiket */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 mx-auto mb-2 shadow-xs">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Validasi E-Ticket Pengunjung</h2>
          <p className="text-xs text-gray-500">
            Ketik kode tiket pembeli atau scan QR Code untuk memvalidasi keaslian tiket
          </p>
        </div>

        <form onSubmit={handleValidateTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Kode Tiket (Scan Barcode / Input Manual)
            </label>
            <div className="relative">
              <input
                type="text"
                value={ticketCodeInput}
                onChange={(e) => setTicketCodeInput(e.target.value.toUpperCase())}
                placeholder="Contoh: TIX-2611-B57466"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-mono font-bold text-gray-900 focus:bg-white focus:border-[#111d5e] focus:outline-none uppercase tracking-wide placeholder:font-sans placeholder:font-normal placeholder:text-gray-400"
                autoFocus
              />
              {ticketCodeInput && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                  title="Reset Input"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleValidateTicket()}
              disabled={loadingCheck || !ticketCodeInput.trim()}
              className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-white border-2 border-[#111d5e] text-[#111d5e] hover:bg-blue-50/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {loadingCheck ? (
                <div className="w-4 h-4 border-2 border-[#111d5e] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Cek Status Validitas
            </button>

            <button
              type="button"
              onClick={() => handleProcessCheckin()}
              disabled={loadingCheckin || !ticketCodeInput.trim()}
              className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#111d5e] text-white hover:bg-[#0c1543] flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md cursor-pointer"
            >
              {loadingCheckin ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Langsung Check-in
            </button>
          </div>
        </form>

        {/* Notifikasi Error Validasi / Pencarian */}
        {validationError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 animate-in fade-in duration-200">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm text-red-800">Tiket Tidak Valid / Tidak Ditemukan</p>
              <p className="text-gray-700">{validationError}</p>
            </div>
          </div>
        )}

        {/* Notifikasi Error Check-In */}
        {checkinError && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm text-amber-800">Check-In Ditolak</p>
              <p className="text-gray-700">{checkinError}</p>
            </div>
          </div>
        )}

        {/* Notifikasi Sukses Langsung Check-In */}
        {checkinResult && checkinResult.success && (
          <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-3 animate-in fade-in duration-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base text-emerald-900">
                  CHECK-IN BERHASIL • PENGUNJUNG DIIZINKAN MASUK
                </h4>
                <p className="text-xs text-emerald-700 font-medium">{checkinResult.message}</p>
              </div>
            </div>

            {checkinResult.ticket && (
              <div className="bg-white/90 p-4 rounded-xl border border-emerald-200 text-xs space-y-1.5 text-gray-800">
                <div className="flex justify-between items-center py-0.5 border-b border-gray-100">
                  <span className="text-gray-500">Kode Tiket:</span>
                  <span className="font-mono font-bold text-gray-900">{checkinResult.ticket.ticket_code}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-gray-100">
                  <span className="text-gray-500">Nama Pemilik:</span>
                  <span className="font-bold text-gray-900">{checkinResult.ticket.owner_name || "-"}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-gray-100">
                  <span className="text-gray-500">Kategori Tiket:</span>
                  <span className="font-bold text-[#111d5e]">{checkinResult.ticket.ticket_category || "-"}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-gray-500">Event:</span>
                  <span className="font-medium text-gray-900">{checkinResult.ticket.event_name || "-"}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Scan / Cek Tiket Berikutnya
            </button>
          </div>
        )}

        {/* HASIL VALIDASI TIKET DETAIL (Jika Petugas Menekan Cek Status) */}
        {validationResult && (
          <div
            className={`p-5 sm:p-6 rounded-2xl border-2 space-y-5 animate-in fade-in duration-200 ${
              validationResult.is_valid
                ? "bg-emerald-50/70 border-emerald-400"
                : "bg-amber-50/70 border-amber-400"
            }`}
          >
            {/* Header Status Tiket */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-gray-200/80">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    validationResult.is_valid
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {validationResult.is_valid ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <AlertCircle className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1 ${
                      validationResult.is_valid
                        ? "bg-emerald-200 text-emerald-950"
                        : "bg-amber-200 text-amber-950"
                    }`}
                  >
                    {validationResult.is_valid ? "Status: VALID" : "Status: SUDAH DIPAKAI"}
                  </span>
                  <h3 className="font-black text-lg text-gray-900 leading-tight">
                    {validationResult.status_label}
                  </h3>
                </div>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-[11px] text-gray-500 block">Kode Tiket</span>
                <span className="font-mono font-black text-base text-gray-900">
                  {validationResult.ticket_code}
                </span>
              </div>
            </div>

            {/* Riwayat Check-in Jika Sudah Pernah Digunakan */}
            {!validationResult.is_valid && validationResult.checkin_time && (
              <div className="p-3.5 bg-amber-100/80 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-800" />
                  Waktu Check-In Sebelumnya:
                </p>
                <p className="pl-5 font-semibold text-gray-900">
                  {new Date(validationResult.checkin_time).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    dateStyle: "full",
                    timeStyle: "medium",
                  })}
                  {validationResult.checked_in_by_staff && (
                    <span> oleh petugas <strong>{validationResult.checked_in_by_staff}</strong></span>
                  )}
                </p>
              </div>
            )}

            {/* Detail Informasi Tiket */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
              <div className="space-y-1">
                <span className="text-gray-400 font-semibold block">Pemegang Tiket</span>
                <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {validationResult.owner_name}
                </p>
                {validationResult.owner_email && (
                  <p className="text-gray-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {validationResult.owner_email}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 font-semibold block">Kategori Tiket</span>
                <p className="font-bold text-[#111d5e] text-sm flex items-center gap-1.5">
                  <TicketIcon className="w-3.5 h-3.5 text-[#111d5e]" />
                  {validationResult.ticket_category}
                </p>
                {validationResult.invoice_code && (
                  <p className="text-gray-500 font-mono text-[11px]">
                    Invoice: {validationResult.invoice_code}
                  </p>
                )}
              </div>

              <div className="space-y-1 sm:col-span-2 pt-2 border-t border-gray-100">
                <span className="text-gray-400 font-semibold block">Event Konser</span>
                <p className="font-bold text-gray-900 text-sm">{validationResult.event_name}</p>
                <p className="text-gray-500 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {formatDate(validationResult.event_date)}
                  </span>
                  {validationResult.event_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {validationResult.event_time}
                    </span>
                  )}
                  {validationResult.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {validationResult.venue} {validationResult.city ? `(${validationResult.city})` : ""}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Tombol Aksi Check-in jika Valid */}
            {validationResult.is_valid ? (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleProcessCheckin(validationResult.ticket_code)}
                  disabled={loadingCheckin}
                  className="w-full py-3.5 px-6 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loadingCheckin ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserCheck className="w-5 h-5" />
                  )}
                  Check-in Pengunjung Sekarang (Izinkan Masuk Gerbang)
                </button>
                <p className="text-[11px] text-center text-gray-500">
                  Menekan tombol ini akan mengubah status tiket menjadi &quot;Used&quot; secara permanen.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Cek Kode Tiket Pengunjung Lainnya
              </button>
            )}
          </div>
        )}

        {/* Panduan Ketentuan Gerbang Masuk */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 space-y-1.5">
          <p className="font-bold text-gray-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#111d5e]" />
            Ketentuan Verifikasi E-Ticket:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-gray-600">
            <li>1 kode tiket hanya dapat digunakan 1 kali untuk masuk venue (anti-duplikasi).</li>
            <li>Petugas wajib memastikan nama pemegang tiket sesuai dengan kartu identitas jika diminta.</li>
            <li>Gunakan tombol <strong>Cek Status Validitas</strong> bila hanya ingin memeriksa tanpa menandai tiket masuk.</li>
            <li>Gunakan tombol <strong>Langsung Check-in</strong> bila pengunjung sudah siap melewati gerbang.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

