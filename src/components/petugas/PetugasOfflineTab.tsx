"use client";

import React, { useState } from "react";
import {
  Lock,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { createOfflineSale, type OfflineSale } from "@/services/offlineSaleService";
import type { TicketCategory } from "@/services/ticketService";

interface PetugasOfflineTabProps {
  canOfflineSales: boolean;
  selectedEventId: string;
  ticketCategories: TicketCategory[];
  offlineSales: OfflineSale[];
  onSaleSuccess: () => void;
}

export default function PetugasOfflineTab({
  canOfflineSales,
  selectedEventId,
  ticketCategories,
  offlineSales,
  onSaleSuccess,
}: PetugasOfflineTabProps) {
  const [offlineForm, setOfflineForm] = useState({
    buyer_name: "",
    phone: "",
    buyer_email: "",
    payment_method: "cash" as "cash" | "qris" | "transfer",
    ticket_category_id: "",
    quantity: 1,
  });
  const [offlineLoading, setOfflineLoading] = useState(false);
  const [offlineSuccess, setOfflineSuccess] = useState<string | null>(null);
  const [offlineError, setOfflineError] = useState<string | null>(null);

  if (!canOfflineSales) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-gray-200 text-center space-y-3 max-w-xl mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-gray-900 text-base">Akses Penjualan Offline Dibatasi</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Akun Anda tidak memiliki izin <strong>offline_sales</strong> pada event ini. Hubungi Administrator untuk mengaktifkan izin penjualan tiket.
        </p>
      </div>
    );
  }

  const selectedCategory = ticketCategories.find((c) => c.id === offlineForm.ticket_category_id);
  const offlineTotal = selectedCategory ? Number(selectedCategory.price) * Number(offlineForm.quantity) : 0;

  const handleOfflineSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !canOfflineSales) return;

    try {
      setOfflineLoading(true);
      setOfflineError(null);
      setOfflineSuccess(null);

      await createOfflineSale({
        event_id: selectedEventId,
        buyer_name: offlineForm.buyer_name.trim(),
        phone: offlineForm.phone.trim(),
        buyer_email: offlineForm.buyer_email ? offlineForm.buyer_email.trim() : undefined,
        payment_method: offlineForm.payment_method,
        ticket_category_id: offlineForm.ticket_category_id,
        quantity: offlineForm.quantity,
      });

      setOfflineSuccess("Penjualan tiket offline berhasil diproses! E-Ticket OTS telah diterbitkan.");
      setOfflineForm({
        buyer_name: "",
        phone: "",
        buyer_email: "",
        payment_method: "cash",
        ticket_category_id: "",
        quantity: 1,
      });

      onSaleSuccess();
    } catch (err: any) {
      setOfflineError(err.message || "Gagal memproses penjualan tiket offline.");
    } finally {
      setOfflineLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 mx-auto mb-2 shadow-xs">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Penjualan Tiket Offline / Loket OTS</h2>
          <p className="text-xs text-gray-500">Input transaksi pembelian tiket langsung di venue konser</p>
        </div>

        {offlineSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{offlineSuccess}</span>
          </div>
        )}

        {offlineError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{offlineError}</span>
            </div>
            <button onClick={() => setOfflineError(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        )}

        <form onSubmit={handleOfflineSale} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Nama Pembeli *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={offlineForm.buyer_name}
                onChange={(e) => setOfflineForm({ ...offlineForm, buyer_name: e.target.value })}
                placeholder="Nama lengkap pembeli"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#111d5e]"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Nomor WhatsApp / HP *</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={offlineForm.phone}
                onChange={(e) => setOfflineForm({ ...offlineForm, phone: e.target.value })}
                placeholder="081234567890"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#111d5e]"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Pembeli (Opsional)</label>
            <div className="relative">
              <input
                type="email"
                value={offlineForm.buyer_email}
                onChange={(e) => setOfflineForm({ ...offlineForm, buyer_email: e.target.value })}
                placeholder="pembeli@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#111d5e]"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Metode Pembayaran *</label>
              <select
                value={offlineForm.payment_method}
                onChange={(e) =>
                  setOfflineForm({ ...offlineForm, payment_method: e.target.value as any })
                }
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#111d5e]"
              >
                <option value="cash">Tunai (Cash Loket)</option>
                <option value="qris">QRIS Statis Venue</option>
                <option value="transfer">Transfer Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Kategori Tiket *</label>
              <select
                required
                value={offlineForm.ticket_category_id}
                onChange={(e) => setOfflineForm({ ...offlineForm, ticket_category_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#111d5e]"
              >
                <option value="">Pilih Kategori</option>
                {ticketCategories.map((cat) => (
                  <option key={cat.id} value={cat.id} disabled={cat.stock <= 0}>
                    {cat.name} - {formatRupiah(cat.price)} (Sisa: {cat.stock})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Jumlah Tiket</label>
            <input
              type="number"
              min={1}
              max={selectedCategory?.stock || 10}
              value={offlineForm.quantity}
              onChange={(e) =>
                setOfflineForm({
                  ...offlineForm,
                  quantity: Math.max(1, parseInt(e.target.value) || 1),
                })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#111d5e]"
            />
          </div>

          {/* Ringkasan Biaya */}
          {selectedCategory && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Kategori Dipilih:</span>
                <span className="text-gray-900 font-bold">{selectedCategory.name}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Harga Satuan:</span>
                <span className="text-gray-900 font-bold">{formatRupiah(selectedCategory.price)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Jumlah Pembelian:</span>
                <span className="text-gray-900 font-bold">{offlineForm.quantity} Tiket</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2.5 mt-2">
                <span className="font-bold text-gray-700">Total Pembayaran:</span>
                <span className="font-black text-[#111d5e] text-base">{formatRupiah(offlineTotal)}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={offlineLoading || !selectedEventId || !offlineForm.ticket_category_id}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#111d5e] hover:bg-[#0c1543] text-white shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {offlineLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses Transaksi...
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Proses Penjualan & Terbitkan E-Ticket OTS
              </>
            )}
          </button>
        </form>
      </div>

      {/* Riwayat Transaksi Offline Petugas */}
      {offlineSales.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Riwayat Penjualan OTS Terkini
          </h3>
          <div className="divide-y divide-gray-100">
            {offlineSales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900">{sale.buyer_name}</p>
                  <p className="text-gray-400 text-[11px]">{sale.phone} • {sale.quantity} Tiket ({sale.payment_method?.toUpperCase()})</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#111d5e]">{formatRupiah(sale.total)}</p>
                  <span className="text-[10px] text-emerald-600 font-bold">Lunas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

