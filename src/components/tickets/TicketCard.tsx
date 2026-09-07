"use client";

import React, { useState } from "react";
import QRCode from "./QRCode";
import { Ticket as TicketType } from "@/services/ticketService";
import { formatDate, getStatusLabel } from "@/lib/utils";
import { Calendar, MapPin, QrCode, CheckCircle2, AlertCircle, Download, User, Sparkles } from "lucide-react";

interface TicketCardProps {
  ticket: TicketType;
  buyerName?: string;
}

export default function TicketCard({ ticket, buyerName }: TicketCardProps) {
  const [showModal, setShowModal] = useState(false);

  const isUsed = ticket.status === "used";

  return (
    <>
      {/* Physical Pass style ticket card */}
      <div className="relative rounded-3xl overflow-hidden glass-card border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 shadow-xl flex flex-col md:flex-row">
        
        {/* Left Side: Event Details */}
        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-widest">
                {ticket.ticket_category || "TICKET PASS"}
              </span>

              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isUsed
                    ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {isUsed ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {getStatusLabel(ticket.status)}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-white">
              {ticket.event_name || "Konser Musik Live"}
            </h3>

            <div className="space-y-1.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{formatDate(ticket.event_date || new Date())}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                <span>{ticket.venue || "Venue Konser Utama"}</span>
              </div>
              {buyerName && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Atas Nama: <strong className="text-white">{buyerName}</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
            <div>
              <span className="block text-[10px] text-zinc-400 font-semibold uppercase">Nomor Tiket</span>
              <span className="font-mono text-xs font-bold text-purple-300 tracking-wider">
                {ticket.ticket_code}
              </span>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-md shadow-purple-600/30 transition-all"
            >
              <QrCode className="w-4 h-4" />
              Tampilkan E-Ticket
            </button>
          </div>
        </div>

        {/* Divider tear line */}
        <div className="relative flex md:flex-col items-center justify-between py-2 md:py-0 md:px-2 bg-zinc-950/60 border-t md:border-t-0 md:border-l border-dashed border-zinc-700">
          <div className="w-4 h-4 rounded-full bg-zinc-950 -ml-2 md:ml-0 md:-mt-2 border border-zinc-800" />
          <div className="w-4 h-4 rounded-full bg-zinc-950 -mr-2 md:mr-0 md:-mb-2 border border-zinc-800" />
        </div>

        {/* Right Side: QR Code preview */}
        <div className="p-6 bg-zinc-950/40 flex flex-col items-center justify-center gap-3">
          <QRCode value={ticket.ticket_code} size={110} />
          <span className="text-[10px] text-zinc-400 font-medium">Tunjukkan QR saat Check-in</span>
        </div>
      </div>

      {/* Full Modal E-Ticket */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md glass-panel rounded-3xl border border-purple-500/40 p-6 space-y-6 text-center shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h4 className="font-extrabold text-white text-lg">E-Ticket Konser Resmi</h4>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* QR Code Big */}
            <div className="flex flex-col items-center justify-center space-y-3 bg-zinc-950/60 p-6 rounded-2xl border border-zinc-800">
              <QRCode value={ticket.ticket_code} size={190} />
              <p className="font-mono text-sm font-bold text-purple-300 tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30">
                {ticket.ticket_code}
              </p>
            </div>

            {/* Event Info */}
            <div className="text-left space-y-2 text-sm bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
              <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                {ticket.ticket_category || "Kategori Tiket"}
              </p>
              <h3 className="font-extrabold text-white text-lg">{ticket.event_name}</h3>
              <p className="text-xs text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                {formatDate(ticket.event_date)}
              </p>
              <p className="text-xs text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-pink-400" />
                {ticket.venue || "Venue Utama"}
              </p>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-500 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <Download className="w-4 h-4" />
                Cetak / Download Ticket
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-3 rounded-xl font-semibold text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
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
