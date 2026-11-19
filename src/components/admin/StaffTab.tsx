"use client";

import React from "react";
import {
  Users,
  Plus,
  ShieldCheck,
  Check,
  Pencil,
  Trash2,
  Search,
  Filter,
  X,
  KeyRound,
  ChevronRight,
} from "lucide-react";
import {
  UI,
  Table,
  Field,
  SectionBar,
} from "./adminShared";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/services/eventService";
import type { StaffAssignment, PetugasUser } from "@/services/staffService";

interface StaffTabProps {
  staffAssignments: StaffAssignment[];
  petugasUsers: PetugasUser[];
  events: Event[];
  showCreateStaffModal: boolean;
  setShowCreateStaffModal: (v: boolean) => void;
  showAssignStaffModal: boolean;
  setShowAssignStaffModal: (v: boolean) => void;
  staffSubTab: "assignments" | "users";
  setStaffSubTab: (v: "assignments" | "users") => void;
  staffSearchQuery: string;
  setStaffSearchQuery: (v: string) => void;
  staffFilterEvent: string;
  setStaffFilterEvent: (v: string) => void;
  staffAccountForm: { name: string; email: string; phone: string; password: string };
  setStaffAccountForm: React.Dispatch<React.SetStateAction<{ name: string; email: string; phone: string; password: string }>>;
  staffAccountLoading: boolean;
  handleCreateStaffAccount: (e: React.FormEvent) => void;
  assignForm: { event_id: string; user_id: string; permissions: string[] };
  setAssignForm: React.Dispatch<React.SetStateAction<{ event_id: string; user_id: string; permissions: string[] }>>;
  assignLoading: boolean;
  handleAssignStaff: (e: React.FormEvent) => void;
  handleToggleStaffStatus: (assignment: StaffAssignment) => void;
  handleRemoveStaffAssignment: (assignment: StaffAssignment) => void;
  editingAssignment: StaffAssignment | null;
  setEditingAssignment: (a: StaffAssignment | null) => void;
  editPermissions: string[];
  setEditPermissions: React.Dispatch<React.SetStateAction<string[]>>;
  editLoading: boolean;
  handleSaveEditedPermissions: (e: React.FormEvent) => void;
  handleOpenEditPermissions: (assignment: StaffAssignment) => void;
}

export default function StaffTab({
  staffAssignments,
  petugasUsers,
  events,
  showCreateStaffModal,
  setShowCreateStaffModal,
  showAssignStaffModal,
  setShowAssignStaffModal,
  staffSubTab,
  setStaffSubTab,
  staffSearchQuery,
  setStaffSearchQuery,
  staffFilterEvent,
  setStaffFilterEvent,
  staffAccountForm,
  setStaffAccountForm,
  staffAccountLoading,
  handleCreateStaffAccount,
  assignForm,
  setAssignForm,
  assignLoading,
  handleAssignStaff,
  handleToggleStaffStatus,
  handleRemoveStaffAssignment,
  editingAssignment,
  setEditingAssignment,
  editPermissions,
  setEditPermissions,
  editLoading,
  handleSaveEditedPermissions,
  handleOpenEditPermissions,
}: StaffTabProps) {
  const activeCount = staffAssignments.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6">
      <SectionBar
        text={`${staffAssignments.length} penugasan event (${activeCount} aktif) • ${petugasUsers.length} total akun petugas terdaftar`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateStaffModal(true)}
              className={UI.btnGhost}
            >
              <Users className="w-4 h-4 text-gray-600" />
              <span>+ Akun Petugas</span>
            </button>
            <button
              onClick={() => {
                setAssignForm({
                  event_id: events[0]?.id || "",
                  user_id: petugasUsers[0]?.id || "",
                  permissions: ["checkin"],
                });
                setShowAssignStaffModal(true);
              }}
              className={UI.btn}
              disabled={events.length === 0 || petugasUsers.length === 0}
              title={petugasUsers.length === 0 ? "Buat akun petugas terlebih dahulu" : undefined}
            >
              <Plus className="w-4 h-4" />
              <span>Tugaskan Petugas</span>
            </button>
          </div>
        }
      />

      {/* Sub-tab Navigation: Penugasan Event vs Daftar Akun Petugas */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStaffSubTab("assignments")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              staffSubTab === "assignments"
                ? "bg-[#111d5e] text-white shadow-xs"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Penugasan Event</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                staffSubTab === "assignments"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {staffAssignments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStaffSubTab("users")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              staffSubTab === "users"
                ? "bg-[#111d5e] text-white shadow-xs"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Akun Petugas</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                staffSubTab === "users"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {petugasUsers.length}
            </span>
          </button>
        </div>
      </div>

      {/* Info Petugas Belum Ditugaskan */}
      {staffSubTab === "assignments" && (() => {
        const unassigned = petugasUsers.filter(
          (p) => !p.total_assigned_events || p.total_assigned_events === 0
        );
        if (unassigned.length === 0) return null;
        return (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Terdapat <strong>{unassigned.length} akun petugas terdaftar</strong> yang belum ditugaskan ke event mana pun (
                {unassigned.map((p) => p.name).slice(0, 3).join(", ")}
                {unassigned.length > 3 ? "..." : ""}).
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStaffSubTab("users")}
              className="font-bold text-amber-900 underline hover:text-amber-700 shrink-0 inline-flex items-center gap-1 cursor-pointer"
            >
              Lihat Akun Petugas <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })()}

      {/* Search & Event Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                staffSubTab === "assignments"
                  ? "Cari nama petugas, email, atau event..."
                  : "Cari nama, email, atau no HP petugas..."
              }
              value={staffSearchQuery}
              onChange={(e) => setStaffSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#111d5e]"
            />
          </div>
          {staffSearchQuery && (
            <button
              onClick={() => setStaffSearchQuery("")}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Reset
            </button>
          )}
        </div>

        {staffSubTab === "assignments" && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span className="text-xs text-gray-500 font-medium shrink-0">Filter Event:</span>
            <select
              value={staffFilterEvent}
              onChange={(e) => setStaffFilterEvent(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:border-[#111d5e]"
            >
              <option value="">Semua Event ({events.length})</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: PENUGASAN EVENT */}
      {staffSubTab === "assignments" && (() => {
        const filteredAssignments = staffAssignments.filter((a) => {
          const matchEvent = !staffFilterEvent || a.event_id === staffFilterEvent;
          const matchQuery =
            !staffSearchQuery ||
            (a.staff_name || "").toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
            (a.staff_email || "").toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
            (a.event_name || "").toLowerCase().includes(staffSearchQuery.toLowerCase());
          return matchEvent && matchQuery;
        });

        const head = [
          { label: "Petugas Lapangan" },
          { label: "Event yang Ditugaskan" },
          { label: "Izin Operasional (Permissions)" },
          { label: "Status Penugasan" },
          { label: "Aksi", align: "right" as const },
        ];

        return (
          <Table head={head}>
            {filteredAssignments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                  {staffAssignments.length === 0
                    ? "Belum ada penugasan petugas ke event. Klik '+ Tugaskan Petugas' untuk memulai penugasan."
                    : "Tidak ada data penugasan yang cocok dengan filter pencarian."}
                </td>
              </tr>
            ) : (
              filteredAssignments.map((assignment) => {
                const assignmentKey = assignment.event_staff_id || assignment.id;
                return (
                  <tr key={assignmentKey} className="hover:bg-gray-50/70 transition-colors">
                    <td className={UI.td}>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                          {assignment.staff_name || "Petugas"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {assignment.staff_email || "-"}
                        </span>
                      </div>
                    </td>
                    <td className={UI.td}>
                      <span className="font-semibold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md text-xs border border-gray-200">
                        {assignment.event_name || "Event"}
                      </span>
                    </td>
                    <td className={UI.td}>
                      <div className="flex flex-wrap gap-1.5">
                        {(!assignment.permissions || assignment.permissions.length === 0) && (
                          <span className="text-xs text-gray-400 italic">Tidak ada izin</span>
                        )}
                        {assignment.permissions?.includes("checkin") && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" /> Check-In
                          </span>
                        )}
                        {assignment.permissions?.includes("offline_sales") && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Check className="w-3 h-3" /> Offline OTS
                          </span>
                        )}
                        {assignment.permissions?.includes("view_visitors") && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Check className="w-3 h-3" /> Pengunjung
                          </span>
                        )}
                        {assignment.permissions?.includes("view_reports") && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <Check className="w-3 h-3" /> Laporan
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={UI.td}>
                      <button
                        type="button"
                        onClick={() => handleToggleStaffStatus(assignment)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          assignment.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                        }`}
                        title="Klik untuk mengubah status aktif/nonaktif"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            assignment.is_active ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        {assignment.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className={`${UI.td} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditPermissions(assignment)}
                          className={UI.iconBtn}
                          title="Edit Hak Akses / Permissions"
                        >
                          <Pencil className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStaffAssignment(assignment)}
                          className={UI.iconBtnDanger}
                          title="Hapus Penugasan dari Event"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </Table>
        );
      })()}

      {/* VIEW 2: DAFTAR AKUN PETUGAS */}
      {staffSubTab === "users" && (() => {
        const filteredPetugasUsers = petugasUsers.filter((p) => {
          if (!staffSearchQuery) return true;
          const q = staffSearchQuery.toLowerCase();
          return (
            (p.name || "").toLowerCase().includes(q) ||
            (p.email || "").toLowerCase().includes(q) ||
            (p.phone || "").toLowerCase().includes(q)
          );
        });

        return (
          <Table
            head={[
              { label: "Nama Petugas" },
              { label: "Email" },
              { label: "No. WhatsApp / HP" },
              { label: "Status Penugasan Event" },
              { label: "Terdaftar Pada" },
              { label: "Aksi", align: "right" as const },
            ]}
            empty="Belum ada akun petugas yang terdaftar. Klik '+ Akun Petugas' untuk membuat akun baru."
          >
            {filteredPetugasUsers.map((petugas) => (
              <tr key={petugas.id} className="hover:bg-gray-50/70 transition-colors">
                <td className={UI.td}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {petugas.name?.slice(0, 2).toUpperCase() || "PT"}
                    </div>
                    <span className="font-bold text-gray-900">{petugas.name}</span>
                  </div>
                </td>
                <td className={UI.td}>{petugas.email}</td>
                <td className={UI.td}>{petugas.phone || "-"}</td>
                <td className={UI.td}>
                  {(petugas.total_assigned_events || 0) > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-3.5 h-3.5" /> {petugas.total_assigned_events} Event Ditugaskan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Belum Ditugaskan
                    </span>
                  )}
                </td>
                <td className={`${UI.td} text-xs text-gray-500`}>
                  {petugas.created_at ? formatDate(petugas.created_at) : "-"}
                </td>
                <td className={`${UI.td} text-right`}>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignForm({
                        event_id: events[0]?.id || "",
                        user_id: petugas.id,
                        permissions: ["checkin"],
                      });
                      setShowAssignStaffModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#111d5e] hover:bg-[#0c1543] text-white transition-all shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tugaskan ke Event</span>
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        );
      })()}

      {/* Modal: Buat Akun Petugas Baru */}
      {showCreateStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-[#111d5e]">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-gray-900">Buat Akun Petugas Baru</h3>
              </div>
              <button onClick={() => setShowCreateStaffModal(false)} className={UI.iconBtn}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaffAccount} className="space-y-4">
              <Field label="Nama Lengkap Petugas *">
                <input
                  type="text"
                  required
                  value={staffAccountForm.name}
                  onChange={(e) =>
                    setStaffAccountForm({ ...staffAccountForm, name: e.target.value })
                  }
                  placeholder="Contoh: Ahmad Fadilah"
                  className={UI.input}
                />
              </Field>

              <Field label="Email Petugas *">
                <input
                  type="email"
                  required
                  value={staffAccountForm.email}
                  onChange={(e) =>
                    setStaffAccountForm({ ...staffAccountForm, email: e.target.value })
                  }
                  placeholder="petugas@tixgoo.com"
                  className={UI.input}
                />
              </Field>

              <Field label="Nomor WhatsApp / Telepon">
                <input
                  type="tel"
                  value={staffAccountForm.phone}
                  onChange={(e) =>
                    setStaffAccountForm({ ...staffAccountForm, phone: e.target.value })
                  }
                  placeholder="081234567890"
                  className={UI.input}
                />
              </Field>

              <Field label="Password Login *">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={staffAccountForm.password}
                  onChange={(e) =>
                    setStaffAccountForm({ ...staffAccountForm, password: e.target.value })
                  }
                  placeholder="Minimal 6 karakter"
                  className={UI.input}
                />
              </Field>

              <p className="text-xs text-gray-500 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                Akun yang dibuat akan memiliki role <strong>petugas</strong> dan langsung dapat ditugaskan ke berbagai event.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateStaffModal(false)}
                  className={UI.btnGhost}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={staffAccountLoading}
                  className={UI.btn}
                >
                  {staffAccountLoading ? "Menyimpan..." : "Buat Akun Petugas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Penugasan Petugas ke Event */}
      {showAssignStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-[#111d5e]">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-gray-900">Tugaskan Petugas ke Event</h3>
              </div>
              <button onClick={() => setShowAssignStaffModal(false)} className={UI.iconBtn}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignStaff} className="space-y-4">
              <Field label="Pilih Event *">
                <select
                  required
                  value={assignForm.event_id}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, event_id: e.target.value })
                  }
                  className={UI.input}
                >
                  <option value="">-- Pilih Event --</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.name} ({formatDate(evt.event_date)})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Pilih Akun Petugas *">
                <select
                  required
                  value={assignForm.user_id}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, user_id: e.target.value })
                  }
                  className={UI.input}
                >
                  <option value="">-- Pilih Akun Petugas --</option>
                  {petugasUsers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </Field>

              <div>
                <label className={UI.label}>Tentukan Izin Operasional (Permissions) *</label>
                <div className="space-y-2 mt-2 bg-gray-50/70 p-3.5 rounded-xl border border-gray-200">
                  {[
                    {
                      id: "checkin",
                      name: "Check-in Tiket",
                      desc: "Memindai QR Code e-ticket pengunjung di pintu masuk venue.",
                    },
                    {
                      id: "offline_sales",
                      name: "Penjualan Tiket Offline OTS",
                      desc: "Melayani transaksi penjualan tiket langsung di loket venue.",
                    },
                    {
                      id: "view_visitors",
                      name: "Lihat Riwayat Pengunjung",
                      desc: "Melihat daftar kehadiran pengunjung yang telah check-in.",
                    },
                    {
                      id: "view_reports",
                      name: "Lihat Dashboard Laporan",
                      desc: "Melihat metrik statistik kehadiran dan penjualan event ini.",
                    },
                  ].map((perm) => {
                    const isChecked = assignForm.permissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? "bg-white border-[#111d5e]/30 shadow-xs"
                            : "bg-transparent border-gray-200 hover:bg-gray-100/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-[#111d5e] focus:ring-[#111d5e]"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignForm({
                                ...assignForm,
                                permissions: [...assignForm.permissions, perm.id],
                              });
                            } else {
                              setAssignForm({
                                ...assignForm,
                                permissions: assignForm.permissions.filter((p) => p !== perm.id),
                              });
                            }
                          }}
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">{perm.name}</p>
                          <p className="text-[11px] text-gray-500 leading-tight">{perm.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAssignStaffModal(false)}
                  className={UI.btnGhost}
                >
                  Batal
                </button>
                <button type="submit" disabled={assignLoading} className={UI.btn}>
                  {assignLoading ? "Menugaskan..." : "Tugaskan ke Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Permissions */}
      {editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-[#111d5e]">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Ubah Izin Petugas</h3>
                  <p className="text-[11px] text-gray-500">
                    {editingAssignment.staff_name} • {editingAssignment.event_name}
                  </p>
                </div>
              </div>
              <button onClick={() => setEditingAssignment(null)} className={UI.iconBtn}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedPermissions} className="space-y-4">
              <div className="space-y-2 bg-gray-50/70 p-3.5 rounded-xl border border-gray-200">
                {[
                  { id: "checkin", name: "Check-in Tiket", desc: "Validasi tiket masuk pengunjung." },
                  { id: "offline_sales", name: "Penjualan Offline OTS", desc: "Melayani penjualan tiket di loket." },
                  { id: "view_visitors", name: "Lihat Riwayat Pengunjung", desc: "Melihat daftar check-in event." },
                  { id: "view_reports", name: "Lihat Dashboard Laporan", desc: "Melihat statistik penjualan event." },
                ].map((perm) => {
                  const isChecked = editPermissions.includes(perm.id);
                  return (
                    <label
                      key={perm.id}
                      className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-white border-[#111d5e]/30 shadow-xs"
                          : "bg-transparent border-gray-200 hover:bg-gray-100/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#111d5e] focus:ring-[#111d5e]"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditPermissions([...editPermissions, perm.id]);
                          } else {
                            setEditPermissions(editPermissions.filter((p) => p !== perm.id));
                          }
                        }}
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-900">{perm.name}</p>
                        <p className="text-[11px] text-gray-500">{perm.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingAssignment(null)}
                  className={UI.btnGhost}
                >
                  Batal
                </button>
                <button type="submit" disabled={editLoading} className={UI.btn}>
                  {editLoading ? "Menyimpan..." : "Simpan Izin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

