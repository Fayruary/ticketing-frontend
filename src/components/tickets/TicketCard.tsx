"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  X,
} from "lucide-react";

interface TicketCardProps {
  ticket: TicketType;
  buyerName?: string;
}

function TicketQR({ ticket, size }: { ticket: TicketType; size: number }) {
  if (ticket.qr_code && ticket.qr_code.startsWith("data:image")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ticket.qr_code}
        alt={`QR ${ticket.ticket_code}`}
        className="object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  return <QRCode value={ticket.ticket_code} size={size} />;
}

export default function TicketCard({ ticket, buyerName }: TicketCardProps) {
  const [showModal, setShowModal] = useState(false);

  const isUsed = ticket.status === "used";
  const owner = ticket.owner_name || buyerName || "Pengunjung Konser";
  const eventName = ticket.event_name || "Konser Musik Live";
  const venue = ticket.venue || "Venue Konser Utama";
  const category = ticket.ticket_category || "Tiket Konser";
  const dateLabel = formatDate(ticket.event_date || new Date());

  // Esc untuk menutup + kunci scroll saat modal terbuka
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [showModal]);

  return (
    <>
      {/* Kartu tiket */}
      <div className="relative flex flex-col md:flex-row overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-sm transition-shadow duration-200 hover:shadow-md break-inside-avoid print:shadow-none [-webkit-print-color-adjust:exact] [print-color-adjust:exact]">
        {/* Kiri: detail event */}
        <div className="flex-1 min-w-0 p-5 sm:p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200 truncate">
              {category}
            </span>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isUsed
                  ? "bg-gray-100 text-gray-600 border-gray-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {isUsed ? (
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {getStatusLabel(ticket.status)}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {eventName}
          </h3>

          <ul className="space-y-2.5 text-sm text-gray-600">
            <li className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 shrink-0 text-blue-600" aria-hidden="true" />
              <span className="font-medium text-gray-800">{dateLabel}</span>
            </li>
            <li className="flex items-center gap-2.5 min-w-0">
              <MapPin className="w-4 h-4 shrink-0 text-rose-500" aria-hidden="true" />
              <span className="font-medium text-gray-800 truncate" title={venue}>
                {venue}
              </span>
            </li>
            <li className="flex items-center gap-2.5 min-w-0">
              <User className="w-4 h-4 shrink-0 text-[#111d5e]" aria-hidden="true" />
              <span className="truncate">
                Pemilik tiket:{" "}
                <strong className="font-semibold text-gray-900">{owner}</strong>
              </span>
            </li>
          </ul>

          <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-[11px] font-medium text-gray-400">
                Nomor tiket
              </span>
              <span className="mt-1 inline-block font-mono text-sm font-bold tracking-wider text-[#111d5e] bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 break-all">
                {ticket.ticket_code}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="print:hidden inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white bg-[#111d5e] hover:bg-[#0c1543] active:bg-[#0a1139] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111d5e] focus-visible:ring-offset-2 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" aria-hidden="true" />
              Tampilkan E-Ticket
            </button>
          </div>
        </div>

        {/* Garis sobekan dengan lubang di tepi kartu */}
        <div
          aria-hidden="true"
          className="relative shrink-0 h-0 md:h-auto md:w-0 border-t md:border-t-0 md:border-l border-dashed border-gray-300"
        >
          <span className="absolute z-10 w-5 h-5 rounded-full bg-slate-100 border border-gray-200 shadow-inner -left-2.5 top-1/2 -translate-y-1/2 md:left-1/2 md:top-0 md:-translate-x-1/2 md:-translate-y-1/2" />
          <span className="absolute z-10 w-5 h-5 rounded-full bg-slate-100 border border-gray-200 shadow-inner -right-2.5 top-1/2 -translate-y-1/2 md:right-auto md:left-1/2 md:top-auto md:bottom-0 md:-translate-x-1/2 md:translate-y-1/2" />
        </div>

        {/* Kanan: preview QR */}
        <div className="shrink-0 md:w-56 p-5 sm:p-6 bg-slate-50/70 flex flex-row md:flex-col items-center justify-center gap-4 md:gap-3">
          <div
            className={`p-2.5 bg-white rounded-2xl border border-gray-200 shadow-sm ${
              isUsed ? "opacity-40 grayscale" : ""
            }`}
          >
            <TicketQR ticket={ticket} size={112} />
          </div>
          <span className="text-xs font-medium text-gray-500 md:text-center leading-snug max-w-[8rem]">
            {isUsed ? "Sudah dipakai saat check-in" : "Scan saat check-in"}
          </span>
        </div>
      </div>

      {/* Modal e-ticket */}
      {showModal &&
        typeof document !== "undefined" &&
        createPortal(
        <div
          data-ticket-print
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:static print:flex print:items-center print:justify-center print:h-[285mm] print:overflow-hidden print:bg-transparent print:p-0 print:backdrop-blur-none"
          onClick={() => setShowModal(false)}
        >
          {/* Saat cetak: hanya e-ticket ini yang dicetak, 1 halaman */}
          <style>{`
            @page { size: A4; margin: 0; }
            @media print {
              body > *:not([data-ticket-print]) { display: none !important; }
              html, body { height: auto !important; overflow: visible !important; background: #fff !important; }
            }
          `}</style>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`E-ticket ${eventName}`}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md max-h-[92vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 space-y-5 shadow-2xl print:max-h-none print:overflow-visible print:max-w-md print:break-inside-avoid [-webkit-print-color-adjust:exact] [print-color-adjust:exact]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isUsed ? "bg-gray-400" : "bg-emerald-500"
                  }`}
                />
                <h4 className="font-extrabold text-gray-900 text-base">
                  E-Ticket Konser Resmi
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Tutup"
                className="print:hidden w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR besar */}
            <div className="flex flex-col items-center gap-3 bg-slate-50 p-6 rounded-2xl border border-gray-200">
              <div
                className={`p-3 bg-white rounded-2xl border border-gray-200 shadow-sm ${
                  isUsed ? "opacity-40 grayscale" : ""
                }`}
              >
                <TicketQR ticket={ticket} size={190} />
              </div>
              <p className="font-mono text-sm font-bold tracking-widest text-[#111d5e] bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                {ticket.ticket_code}
              </p>
              {isUsed && (
                <p className="text-xs font-medium text-gray-500">
                  Tiket ini sudah dipakai
                </p>
              )}
            </div>

            {/* Info event */}
            <div className="space-y-2.5 bg-slate-50/80 p-4 rounded-2xl border border-gray-200 text-sm">
              <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-100">
                {category}
              </span>
              <h3 className="font-extrabold text-gray-900 text-base leading-snug">
                {eventName}
              </h3>
              <ul className="space-y-1.5 pt-1 text-gray-600">
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span>{dateLabel}</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0 text-rose-500" aria-hidden="true" />
                  <span>{venue}</span>
                </li>
                <li className="flex items-center gap-2">
                  <User className="w-4 h-4 shrink-0 text-[#111d5e]" aria-hidden="true" />
                  <span>
                    Pemilik tiket:{" "}
                    <strong className="font-semibold text-gray-900">{owner}</strong>
                  </span>
                </li>
              </ul>
            </div>

            {/* Aksi */}
            <div className="flex gap-3 pt-1 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white bg-[#111d5e] hover:bg-[#0c1543] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111d5e] focus-visible:ring-offset-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                Cetak / Simpan PDF
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="h-11 px-5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>

        </div>,
        document.body
      )}
    </>
  );
}