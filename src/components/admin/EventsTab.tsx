"use client";

import React from "react";
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Ticket,
} from "lucide-react";
import {
  UI,
  Table,
  Badge,
  Field,
  FormPanel,
  SectionBar,
  Pagination,
  usePagination,
  RupiahInput,
} from "./adminShared";
import { formatDate, formatRupiah, getStatusLabel } from "@/lib/utils";
import type { Event } from "@/services/eventService";
import type { Organizer } from "@/services/organizerService";
import type { TicketCategory } from "@/services/ticketService";

interface EventsTabProps {
  events: Event[];
  organizers: Organizer[];
  showEventForm: boolean;
  setShowEventForm: (show: boolean) => void;
  editingEvent: Partial<Event> | null;
  setEditingEvent: (event: Partial<Event> | null) => void;
  eventForm: Partial<Event>;
  setEventForm: React.Dispatch<React.SetStateAction<Partial<Event>>>;
  handleSaveEvent: () => void;
  handleDeleteEvent: (id: string) => void;
  handlePublishEvent: (id: string) => void;
  closeEventForm: () => void;
  selectedEventForTickets: string;
  setSelectedEventForTickets: (id: string) => void;
  ticketCategories: TicketCategory[];
  showTicketForm: boolean;
  setShowTicketForm: (show: boolean) => void;
  editingTicketId: string | null;
  setEditingTicketId: (id: string | null) => void;
  ticketForm: Partial<TicketCategory>;
  setTicketForm: React.Dispatch<React.SetStateAction<Partial<TicketCategory>>>;
  handleSaveTicketCategory: () => void;
  handleDeleteTicketCategory: (id: string) => void;
  closeTicketForm: () => void;
  openEditTicket: (cat: TicketCategory) => void;
}

export default function EventsTab({
  events,
  organizers,
  showEventForm,
  setShowEventForm,
  editingEvent,
  setEditingEvent,
  eventForm,
  setEventForm,
  handleSaveEvent,
  handleDeleteEvent,
  handlePublishEvent,
  closeEventForm,
  selectedEventForTickets,
  setSelectedEventForTickets,
  ticketCategories,
  showTicketForm,
  setShowTicketForm,
  editingTicketId,
  setEditingTicketId,
  ticketForm,
  setTicketForm,
  handleSaveTicketCategory,
  handleDeleteTicketCategory,
  closeTicketForm,
  openEditTicket,
}: EventsTabProps) {
  const eventPg = usePagination(events);
  const ticketPg = usePagination(ticketCategories);

  const eventFields: { key: string; label: string; type: string }[] = [
    { key: "name", label: "Nama event", type: "text" },
    { key: "city", label: "Kota", type: "text" },
    { key: "venue", label: "Venue", type: "text" },
    { key: "capacity", label: "Kapasitas", type: "number" },
    { key: "event_date", label: "Tanggal", type: "date" },
    { key: "event_time", label: "Waktu", type: "time" },
    { key: "genre", label: "Genre musik", type: "text" },
    { key: "poster", label: "URL poster", type: "url" },
  ];

  return (
    <div className="space-y-6">
      <SectionBar
        text={`${events.length} event terdaftar`}
        action={
          <button
            onClick={() => {
              setShowEventForm(true);
              setEditingEvent(null);
              setEventForm({});
            }}
            className={UI.btn}
          >
            <Plus className="w-4 h-4" /> Tambah Event
          </button>
        }
      />

      {showEventForm && (
        <FormPanel
          title={editingEvent?.id ? "Edit Event" : "Event Baru"}
          onClose={closeEventForm}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {eventFields.map(({ key, label, type }) => (
              <Field key={key} label={label}>
                <input
                  type={type}
                  value={(eventForm as any)[key] || ""}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, [key]: e.target.value })
                  }
                  className={UI.input}
                />
              </Field>
            ))}
            <Field label="Organizer" className="sm:col-span-2">
              <select
                value={(eventForm as any).organizer_id || ""}
                onChange={(e) =>
                  setEventForm({ ...eventForm, organizer_id: e.target.value })
                }
                className={UI.input}
              >
                <option value="">Tanpa organizer</option>
                {organizers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} - {o.company_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Deskripsi" className="sm:col-span-2">
              <textarea
                rows={3}
                value={(eventForm as any).description || ""}
                onChange={(e) =>
                  setEventForm({ ...eventForm, description: e.target.value })
                }
                className={`${UI.input} resize-none`}
              />
            </Field>
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={handleSaveEvent} className={UI.btn}>
              {editingEvent?.id ? "Simpan Perubahan" : "Simpan Event"}
            </button>
            <button onClick={closeEventForm} className={UI.btnGhost}>
              Batal
            </button>
          </div>
        </FormPanel>
      )}

      <Table
        head={[
          { label: "Nama Event" },
          { label: "Kota" },
          { label: "Tanggal" },
          { label: "Status" },
          { label: "", align: "right" },
        ]}
        empty="Belum ada event terdaftar."
        footer={<Pagination {...eventPg} onChange={eventPg.setPage} inCard />}
      >
        {eventPg.pageItems.map((event) => (
          <tr key={event.id} className="hover:bg-gray-50/70 transition-colors">
            <td className={UI.td}>
              <div className="flex items-center gap-3">
                {(event as any).poster ? (
                  <img
                    src={(event as any).poster}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                    onError={(e: any) => {
                      e.target.style.visibility = "hidden";
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#111d5e] flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                )}
                <span className="font-semibold text-gray-900">{event.name}</span>
              </div>
            </td>
            <td className={UI.td}>{event.city || "-"}</td>
            <td className={UI.td}>{formatDate(event.event_date)}</td>
            <td className={UI.td}>
              <Badge
                tone={
                  event.status === "published"
                    ? "green"
                    : event.status === "draft"
                    ? "gray"
                    : "amber"
                }
              >
                {getStatusLabel(event.status)}
              </Badge>
            </td>
            <td className={UI.td}>
              <div className="flex items-center justify-end gap-1">
                {event.status === "draft" && (
                  <button
                    onClick={() => handlePublishEvent(event.id)}
                    className={`${UI.btnLink} px-2`}
                  >
                    Publikasikan
                  </button>
                )}
                <button
                  onClick={() => setSelectedEventForTickets(event.id)}
                  className={UI.iconBtn}
                  title="Kategori Tiket"
                >
                  <Ticket className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingEvent(event);
                    setEventForm(event);
                    setShowEventForm(true);
                  }}
                  className={UI.iconBtn}
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className={UI.iconBtnDanger}
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Ticket Categories Sub-panel */}
      {selectedEventForTickets && (
        <section className={`${UI.card} p-6 space-y-4 animate-in fade-in duration-200`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-gray-900">
              Kategori Tiket •{" "}
              <span className="text-[#111d5e]">
                {events.find((e) => e.id === selectedEventForTickets)?.name}
              </span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (showTicketForm) closeTicketForm();
                  else {
                    setEditingTicketId(null);
                    setTicketForm({});
                    setShowTicketForm(true);
                  }
                }}
                className={UI.btn}
              >
                <Plus className="w-4 h-4" /> Tambah Kategori
              </button>
              <button
                onClick={() => {
                  setSelectedEventForTickets("");
                  closeTicketForm();
                }}
                className={UI.btnGhost}
              >
                Tutup
              </button>
            </div>
          </div>

          {showTicketForm && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-200/80">
              <p className="text-sm font-bold text-gray-900">
                {editingTicketId ? "Edit Kategori Tiket" : "Kategori Tiket Baru"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Nama Kategori (VIP, Festival, Tribune)">
                  <input
                    type="text"
                    value={ticketForm.name || ""}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, name: e.target.value })
                    }
                    className={UI.input}
                  />
                </Field>
                <Field label="Harga">
                  <RupiahInput
                    value={ticketForm.price}
                    onChange={(n) => setTicketForm({ ...ticketForm, price: n })}
                  />
                </Field>
                <Field label="Stok Tiket">
                  <input
                    type="number"
                    min={0}
                    value={ticketForm.stock ?? ""}
                    onChange={(e) =>
                      setTicketForm({
                        ...ticketForm,
                        stock: Number(e.target.value),
                      })
                    }
                    className={UI.input}
                  />
                </Field>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveTicketCategory} className={UI.btn}>
                  {editingTicketId ? "Simpan Perubahan" : "Simpan Kategori"}
                </button>
                <button onClick={closeTicketForm} className={UI.btnGhost}>
                  Batal
                </button>
              </div>
            </div>
          )}

          {ticketCategories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Event ini belum memiliki kategori tiket.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {ticketPg.pageItems.map((cat) => (
                  <li
                    key={cat.id}
                    className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50/70 transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                      <span className="font-bold text-gray-900">{cat.name}</span>
                      <span className="text-[#111d5e] font-semibold">
                        {formatRupiah(cat.price)}
                      </span>
                      <span className="text-gray-500">Stok: {cat.stock}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => openEditTicket(cat)}
                        className={UI.iconBtn}
                        title="Edit Kategori"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTicketCategory(cat.id)}
                        className={UI.iconBtnDanger}
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination {...ticketPg} onChange={ticketPg.setPage} />
            </>
          )}
        </section>
      )}
    </div>
  );
}

