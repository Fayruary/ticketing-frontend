"use client";

import React, { useState } from "react";
import QRCode from "./QRCode";
import { Ticket as TicketType } from "@/services/ticketService";
import { formatDate, getStatusLabel } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Printer,
  User,
  Clock,
  Sparkles,
  ShieldCheck,
  X
} from "lucide-react";

interface TicketCardProps {
  ticket: TicketType;
  buyerName?: string;
}

export default function TicketCard({ ticket, buyerName }: TicketCardProps) {
  const [showModal, setShowModal] = useState(false);

  const isUsed = ticket.status === "used";
  const owner = ticket.owner_name || buyerName || "Pengunjung Konser";

  return (
    <>
      {/* Physical Concert Pass Style Card - Consistent TixGoo Visual Identity */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-gray-200/90 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col md:flex-row">
        {/* Left Side: Event & Pass Details */}
        <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
          <div className="space-y-3.5">
            {/* Category & Status Badges */}
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {ticket.ticket_category || "Tiket Konser"}
              </span>

              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isUsed
                    ? "bg-gray-100 text-gray-600 border border-gray-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {isUsed ? (
                  <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{getStatusLabel(ticket.status)}</span>
              </span>
            </div>

            {/* Event Name */}
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight leading-snug">
                {ticket.event_name || "Konser Musik Live"}
              </h3>
            </div>

            {/* Event Meta Rows */}
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium">{formatDate(ticket.event_date || new Date())}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-medium line-clamp-1">{ticket.venue || "Venue Konser Utama"}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#111d5e] shrink-0" />
                <span>
                  Pemilik Tiket: <strong className="text-gray-900 font-bold">{owner}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Code & Action Bar */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Nomor Tiket Unik
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-[#111d5e] tracking-wider bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 inline-block mt-0.5">
                {ticket.ticket_code}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#111d5e] hover:bg-[#0c1543] active:scale-98 text-white shadow-sm transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Tampilkan E-Ticket</span>
            </button>
          </div>
        </div>

        {/* Perforation Tear Line with punch holes */}
        <div className="relative flex md:flex-col items-center justify-between py-2 md:py-0 md:px-2 bg-slate-50/50 border-t md:border-t-0 md:border-l border-dashed border-gray-300">
          <div className="w-5 h-5 rounded-full bg-slate-100 -ml-2.5 md:ml-0 md:-mt-2.5 border border-gray-200" />
          <div className="w-5 h-5 rounded-full bg-slate-100 -mr-2.5 md:mr-0 md:-mb-2.5 border border-gray-200" />
        </div>

        {/* Right Side: QR Code Preview */}
        <div className="p-6 bg-slate-50/70 flex flex-col items-center justify-center gap-3 md:w-56 shrink-0 border-t md:border-t-0">
          <div className="p-2.5 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center">
            {ticket.qr_code && ticket.qr_code.startsWith("data:image") ? (
              <img
                src={ticket.qr_code}
                alt={`QR ${ticket.ticket_code}`}
                className="w-28 h-28 object-contain"
              />
            ) : (
              <QRCode value={ticket.ticket_code} size={112} />
            )}
          </div>
          <span className="text-[10px] text-gray-500 font-semibold tracking-wide uppercase text-center">
            Scan saat Check-in
          </span>
        </div>
      </div>

      {/* Full Modal E-Ticket Pop-up */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 space-y-5 text-center shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="font-black text-gray-900 text-base">E-Ticket Konser Resmi</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code Big Container */}
            <div className="flex flex-col items-center justify-center space-y-3 bg-slate-50 p-6 rounded-2xl border border-gray-200">
              <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                {ticket.qr_code && ticket.qr_code.startsWith("data:image") ? (
                  <img
                    src={ticket.qr_code}
                    alt={`QR ${ticket.ticket_code}`}
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <QRCode value={ticket.ticket_code} size={190} />
                )}
              </div>
              <p className="font-mono text-sm font-bold text-[#111d5e] tracking-widest bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-2xs">
                {ticket.ticket_code}
              </p>
            </div>

            {/* Event Info Details */}
            <div className="text-left space-y-2 bg-slate-50/80 p-4 rounded-2xl border border-gray-200 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 inline-block">
                {ticket.ticket_category || "Kategori Tiket"}
              </span>
              <h3 className="font-black text-gray-900 text-base leading-snug">
                {ticket.event_name || "Konser Musik Live"}
              </h3>
              <div className="space-y-1 pt-1 text-gray-600">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{formatDate(ticket.event_date)}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{ticket.venue || "Venue Utama"}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#111d5e] shrink-0" />
                  <span>
                    Pemilik Tiket: <strong className="text-gray-900">{owner}</strong>
                  </span>
                </p>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#111d5e] hover:bg-[#0c1543] text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
