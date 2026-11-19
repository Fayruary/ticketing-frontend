"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import { Check } from "lucide-react";
import type { AssignedEvent } from "@/services/staffService";

interface PetugasEventBannerProps {
  selectedEvent: AssignedEvent | undefined;
  canCheckin: boolean;
  canOfflineSales: boolean;
  canViewVisitors: boolean;
  canViewReports: boolean;
}

export default function PetugasEventBanner({
  selectedEvent,
  canCheckin,
  canOfflineSales,
  canViewVisitors,
  canViewReports,
}: PetugasEventBannerProps) {
  if (!selectedEvent) return null;

  const currentEventTitle =
    selectedEvent.name || (selectedEvent as any).event_name || "Event Konser";
  const permissions = selectedEvent.permissions || [];

  return (
    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="font-bold text-lg text-gray-900">{currentEventTitle}</h2>
        </div>
        <p className="text-xs text-gray-500">
          {formatDate(selectedEvent.event_date)} • {selectedEvent.venue || "Venue Konser"} •{" "}
          {selectedEvent.city || ""}
        </p>
      </div>

      {/* Badges Izin Operasional Petugas */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-gray-500 font-medium mr-1">Izin Anda:</span>
        {canCheckin && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3.5 h-3.5" /> Check-in
          </span>
        )}
        {canOfflineSales && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Check className="w-3.5 h-3.5" /> Penjualan OTS
          </span>
        )}
        {canViewVisitors && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Check className="w-3.5 h-3.5" /> Pengunjung
          </span>
        )}
        {canViewReports && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Check className="w-3.5 h-3.5" /> Laporan
          </span>
        )}
        {permissions.length === 0 && (
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Belum ada izin operasional
          </span>
        )}
      </div>
    </div>
  );
}

