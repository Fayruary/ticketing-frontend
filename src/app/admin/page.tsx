"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { getAdminDashboard, type AdminDashboard } from "@/services/dashboardService";
import { getEvents, createEvent, updateEvent, deleteEvent, publishEvent, type Event } from "@/services/eventService";
import {
  getBanners,
  createBanner,
  updateBanner,
  toggleBanner,
  deleteBanner,
  resolveBannerImageUrl,
  type Banner,
} from "@/services/bannerService";
import { getPackages, createPackage, deletePackage, type CooperationPackage } from "@/services/packageService";
import { getOrganizers, type Organizer } from "@/services/organizerService";
import { getUsers, deleteUser } from "@/services/userService";
import { getAllOrders, type Order } from "@/services/orderService";
import {
  getTicketCategories,
  createTicketCategory,
  updateTicketCategory,
  deleteTicketCategory,
  type TicketCategory,
} from "@/services/ticketService";
import type { User as AuthUser } from "@/lib/auth";
import {
  getAllStaffAssignments,
  getAllPetugasUsers,
  createStaffAccount,
  assignStaff,
  updateStaffPermissions,
  toggleStaffStatus,
  removeStaff,
  type StaffAssignment,
  type PetugasUser,
} from "@/services/staffService";

import type { AdminTab } from "@/components/admin/adminTokens";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import OverviewTab from "@/components/admin/OverviewTab";
import EventsTab from "@/components/admin/EventsTab";
import StaffTab from "@/components/admin/StaffTab";
import BannersTab from "@/components/admin/BannersTab";
import PackagesTab from "@/components/admin/PackagesTab";
import UsersTab from "@/components/admin/UsersTab";
import OrdersTab from "@/components/admin/OrdersTab";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, role, loading: authLoading, logout } = useAuth();

  const [tab, setTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Platform Data
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [packages, setPackages] = useState<CooperationPackage[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [selectedEventForTickets, setSelectedEventForTickets] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Event Form State
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [eventForm, setEventForm] = useState<Partial<Event>>({});

  // Ticket Form State
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState<Partial<TicketCategory>>({});
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);

  // Banner Form State
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({});
  const [bannerImageMode, setBannerImageMode] = useState<"file" | "url">("file");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [bannerSaving, setBannerSaving] = useState(false);

  // Package Form State
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [packageForm, setPackageForm] = useState<Partial<CooperationPackage>>({});

  // Staff Management State
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [petugasUsers, setPetugasUsers] = useState<PetugasUser[]>([]);
  const [staffSubTab, setStaffSubTab] = useState<"assignments" | "users">("assignments");
  const [staffFilterEvent, setStaffFilterEvent] = useState<string>("");
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>("");

  // Modal: Buat Akun Petugas
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [staffAccountForm, setStaffAccountForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [staffAccountLoading, setStaffAccountLoading] = useState(false);

  // Modal: Penugasan Staff ke Event
  const [showAssignStaffModal, setShowAssignStaffModal] = useState(false);
  const [assignForm, setAssignForm] = useState<{ event_id: string; user_id: string; permissions: string[] }>({
    event_id: "",
    user_id: "",
    permissions: ["checkin"],
  });
  const [assignLoading, setAssignLoading] = useState(false);

  // Modal: Edit Permissions
  const [editingAssignment, setEditingAssignment] = useState<StaffAssignment | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  // Auth Protection
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== "admin")) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, role, router]);

  useEffect(() => {
    if (isAuthenticated && role === "admin") {
      fetchAll();
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (selectedEventForTickets) {
      fetchTicketCategories(selectedEventForTickets);
    }
  }, [selectedEventForTickets]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const run = async (fn: () => Promise<unknown>, okMsg: string, after?: () => void) => {
    try {
      await fn();
      showSuccess(okMsg);
      after?.();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    }
  };

  const fetchAll = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const [dashRes, evtRes, banRes, pkgRes, orgRes, usrRes, ordRes, staffRes, petugasRes] =
        await Promise.allSettled([
          getAdminDashboard(),
          getEvents(),
          getBanners(),
          getPackages(),
          getOrganizers(),
          getUsers(),
          getAllOrders(),
          getAllStaffAssignments(),
          getAllPetugasUsers(),
        ]);

      if (dashRes.status === "fulfilled") setDashboard(dashRes.value as any);
      if (evtRes.status === "fulfilled") setEvents(Array.isArray(evtRes.value) ? evtRes.value : []);
      if (banRes.status === "fulfilled") setBanners(Array.isArray(banRes.value) ? banRes.value : []);
      if (pkgRes.status === "fulfilled") setPackages(Array.isArray(pkgRes.value) ? pkgRes.value : []);
      if (orgRes.status === "fulfilled") setOrganizers(Array.isArray(orgRes.value) ? orgRes.value : []);
      if (usrRes.status === "fulfilled") setUsers(Array.isArray(usrRes.value) ? usrRes.value : []);
      if (ordRes.status === "fulfilled") setOrders(Array.isArray(ordRes.value) ? ordRes.value : []);
      if (staffRes.status === "fulfilled") setStaffAssignments(Array.isArray(staffRes.value) ? staffRes.value : []);
      if (petugasRes.status === "fulfilled") setPetugasUsers(Array.isArray(petugasRes.value) ? petugasRes.value : []);

      if (petugasRes.status === "rejected" || staffRes.status === "rejected") {
        return false;
      }
      return true;
    } catch {
      setError("Gagal memuat data dashboard");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketCategories = async (eventId: string) => {
    try {
      const res: any = await getTicketCategories(eventId);
      setTicketCategories(Array.isArray(res) ? res : res?.data || []);
    } catch {
      setTicketCategories([]);
    }
  };

  // --- Events Handlers ---
  const closeEventForm = () => {
    setShowEventForm(false);
    setEventForm({});
    setEditingEvent(null);
  };

  const handleSaveEvent = () =>
    run(
      () => (editingEvent?.id ? updateEvent(editingEvent.id, eventForm) : createEvent(eventForm)),
      editingEvent?.id ? "Event diperbarui" : "Event ditambahkan",
      () => {
        closeEventForm();
        fetchAll();
      }
    );

  const handleDeleteEvent = (id: string) =>
    confirm("Hapus event ini?") && run(() => deleteEvent(id), "Event dihapus", fetchAll);

  const handlePublishEvent = (id: string) =>
    run(() => publishEvent(id), "Event dipublikasikan", fetchAll);

  const openCreateEvent = () => {
    setEditingEvent(null);
    setEventForm({});
    setShowEventForm(true);
    setTab("events");
  };

  // --- Ticket Categories Handlers ---
  const closeTicketForm = () => {
    setShowTicketForm(false);
    setTicketForm({});
    setEditingTicketId(null);
  };

  const openEditTicket = (cat: TicketCategory) => {
    setEditingTicketId(String(cat.id));
    setTicketForm({ name: cat.name, price: cat.price, stock: cat.stock });
    setShowTicketForm(true);
  };

  const handleSaveTicketCategory = () => {
    if (!ticketForm.name?.trim()) {
      setError("Nama kategori wajib diisi");
      return;
    }
    const data = { name: ticketForm.name.trim(), price: ticketForm.price || 0, stock: ticketForm.stock || 0 };
    return run(
      () =>
        editingTicketId
          ? updateTicketCategory(editingTicketId, data as any)
          : createTicketCategory({ ...data, event_id: selectedEventForTickets } as any),
      editingTicketId ? "Kategori tiket diperbarui" : "Kategori tiket ditambahkan",
      () => {
        closeTicketForm();
        fetchTicketCategories(selectedEventForTickets);
      }
    );
  };

  const handleDeleteTicketCategory = (id: string) =>
    confirm("Hapus kategori tiket ini?") &&
    run(() => deleteTicketCategory(id), "Kategori tiket dihapus", () =>
      fetchTicketCategories(selectedEventForTickets)
    );

  // --- Banners Handlers ---
  const closeBannerForm = () => {
    setShowBannerForm(false);
    setEditingBanner(null);
    setBannerForm({});
    setBannerFile(null);
    setBannerPreview("");
  };

  const openCreateBanner = () => {
    setEditingBanner(null);
    setBannerForm({ title: "", link_url: "/events", is_active: true, image: "" });
    setBannerFile(null);
    setBannerPreview("");
    setBannerImageMode("file");
    setShowBannerForm(true);
  };

  const openEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      link_url: banner.link_url || "/events",
      is_active: banner.is_active,
      image: banner.image || banner.image_url || "",
    });
    setBannerFile(null);
    setBannerPreview(resolveBannerImageUrl(banner.image || banner.image_url));
    setBannerImageMode(banner.image && banner.image.startsWith("http") ? "url" : "file");
    setShowBannerForm(true);
  };

  const handleSaveBanner = async () => {
    try {
      setBannerSaving(true);
      if (!bannerForm.title?.trim()) throw new Error("Judul banner wajib diisi");
      if (bannerImageMode === "file" && !bannerFile && !editingBanner?.image)
        throw new Error("Pilih file gambar banner");
      if (bannerImageMode === "url" && !bannerForm.image?.trim() && !editingBanner?.image)
        throw new Error("URL gambar banner wajib diisi");

      const title = bannerForm.title.trim();
      const link_url = bannerForm.link_url?.trim() || "/events";
      const is_active = bannerForm.is_active !== false;

      let payload: FormData | Partial<Banner>;
      if (bannerImageMode === "file" && bannerFile) {
        const fd = new FormData();
        fd.append("title", title);
        fd.append("link_url", link_url);
        fd.append("is_active", String(is_active));
        fd.append("image", bannerFile);
        payload = fd;
      } else {
        payload = {
          title,
          link_url,
          is_active,
          image: bannerForm.image?.trim() || editingBanner?.image || "",
        };
      }

      if (editingBanner?.id) {
        await updateBanner(editingBanner.id, payload as any);
        showSuccess("Banner diperbarui");
      } else {
        await createBanner(payload as any);
        showSuccess("Banner ditambahkan");
      }
      closeBannerForm();
      fetchAll();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan banner");
    } finally {
      setBannerSaving(false);
    }
  };

  const handleToggleBanner = (id: number | string) =>
    run(() => toggleBanner(id), "Status banner diubah", fetchAll);

  const handleDeleteBanner = (id: number | string) =>
    confirm("Hapus banner ini?") && run(() => deleteBanner(id), "Banner dihapus", fetchAll);

  // --- Packages & Users Handlers ---
  const handleSavePackage = () =>
    run(
      () => createPackage(packageForm),
      "Paket ditambahkan",
      () => {
        setShowPackageForm(false);
        setPackageForm({});
        fetchAll();
      }
    );

  const handleDeletePackage = (id: number) =>
    confirm("Hapus paket ini?") && run(() => deletePackage(id), "Paket dihapus", fetchAll);

  const handleDeleteUser = (id: string) =>
    confirm("Hapus pengguna ini?") && run(() => deleteUser(id), "Pengguna dihapus", fetchAll);

  // --- Staff Management Handlers ---
  const handleCreateStaffAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffAccountForm.name || !staffAccountForm.email || !staffAccountForm.password) {
      setError("Nama, email, dan password wajib diisi");
      return;
    }
    setStaffAccountLoading(true);
    try {
      const createdUser = await createStaffAccount(staffAccountForm);
      const refetched = await fetchAll();
      if (!refetched) {
        setError("Akun petugas berhasil dibuat, tetapi sinkronisasi data gagal. Silakan refresh halaman.");
        return;
      }
      showSuccess(`Akun petugas "${createdUser?.name || staffAccountForm.name}" berhasil dibuat!`);
      setShowCreateStaffModal(false);
      setStaffAccountForm({ name: "", email: "", phone: "", password: "" });
      setStaffSubTab("users");
    } catch (err: any) {
      setError(err.message || "Gagal membuat akun petugas");
    } finally {
      setStaffAccountLoading(false);
    }
  };

  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.event_id || !assignForm.user_id) {
      setError("Pilih event dan akun petugas terlebih dahulu");
      return;
    }
    if (assignForm.permissions.length === 0) {
      setError("Pilih minimal satu permission untuk petugas");
      return;
    }
    setAssignLoading(true);
    try {
      await assignStaff(assignForm);
      showSuccess("Petugas berhasil ditugaskan ke event");
      setShowAssignStaffModal(false);
      setAssignForm({ event_id: "", user_id: "", permissions: ["checkin"] });
      await fetchAll();
      setStaffSubTab("assignments");
    } catch (err: any) {
      setError(err.message || "Gagal menugaskan petugas");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleToggleStaffStatus = (assignment: StaffAssignment) => {
    const assignmentId = assignment.id || (assignment as any).event_staff_id;
    if (!assignmentId) {
      setError("ID penugasan tidak valid");
      return;
    }
    const nextStatus = !assignment.is_active;
    run(
      () => toggleStaffStatus(assignmentId, nextStatus),
      `Status penugasan petugas diubah menjadi ${nextStatus ? "Aktif" : "Nonaktif"}`,
      fetchAll
    );
  };

  const handleOpenEditPermissions = (assignment: StaffAssignment) => {
    setEditingAssignment(assignment);
    setEditPermissions([...assignment.permissions]);
  };

  const handleSaveEditedPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;
    const assignmentId = editingAssignment.id || (editingAssignment as any).event_staff_id;
    if (!assignmentId) {
      setError("ID penugasan tidak valid");
      return;
    }
    if (editPermissions.length === 0) {
      setError("Pilih minimal satu permission untuk petugas");
      return;
    }
    setEditLoading(true);
    try {
      await updateStaffPermissions(assignmentId, editPermissions);
      showSuccess("Permission petugas berhasil diperbarui");
      setEditingAssignment(null);
      await fetchAll();
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui permissions petugas");
    } finally {
      setEditLoading(false);
    }
  };

  const handleRemoveStaffAssignment = (assignment: StaffAssignment) => {
    const assignmentId = assignment.id || (assignment as any).event_staff_id;
    if (!assignmentId) {
      setError("ID penugasan tidak valid");
      return;
    }
    if (
      confirm(
        `Hapus penugasan ${assignment.staff_name || "petugas"} dari event ${assignment.event_name || ""}?`
      )
    ) {
      run(() => removeStaff(assignmentId), "Penugasan petugas berhasil dihapus", fetchAll);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f5fa]">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="w-5 h-5 border-2 border-[#111d5e] border-t-transparent rounded-full animate-spin" />
          Memuat dashboard...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || role !== "admin") return null;

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-gray-900">
      {/* Sidebar Modular */}
      <AdminSidebar
        tab={tab}
        setTab={setTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        logout={logout}
        onLogoutRedirect={() => {
          logout();
          router.push("/login");
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <AdminHeader tab={tab} setSidebarOpen={setSidebarOpen} user={user} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Notifications */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-xs font-semibold hover:underline ml-4"
              >
                Tutup
              </button>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-center justify-between">
              <span>{successMsg}</span>
              <button
                onClick={() => setSuccessMsg(null)}
                className="text-xs font-semibold hover:underline ml-4"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Active Modular Tab */}
          {tab === "overview" && (
            <OverviewTab
              user={user}
              orders={orders}
              events={events}
              users={users}
              dashboard={dashboard}
              setTab={setTab}
              openCreateEvent={openCreateEvent}
            />
          )}

          {tab === "events" && (
            <EventsTab
              events={events}
              organizers={organizers}
              showEventForm={showEventForm}
              setShowEventForm={setShowEventForm}
              editingEvent={editingEvent}
              setEditingEvent={setEditingEvent}
              eventForm={eventForm}
              setEventForm={setEventForm}
              handleSaveEvent={handleSaveEvent}
              handleDeleteEvent={handleDeleteEvent}
              handlePublishEvent={handlePublishEvent}
              closeEventForm={closeEventForm}
              selectedEventForTickets={selectedEventForTickets}
              setSelectedEventForTickets={setSelectedEventForTickets}
              ticketCategories={ticketCategories}
              showTicketForm={showTicketForm}
              setShowTicketForm={setShowTicketForm}
              editingTicketId={editingTicketId}
              setEditingTicketId={setEditingTicketId}
              ticketForm={ticketForm}
              setTicketForm={setTicketForm}
              handleSaveTicketCategory={handleSaveTicketCategory}
              handleDeleteTicketCategory={handleDeleteTicketCategory}
              closeTicketForm={closeTicketForm}
              openEditTicket={openEditTicket}
            />
          )}

          {tab === "staff" && (
            <StaffTab
              staffAssignments={staffAssignments}
              petugasUsers={petugasUsers}
              events={events}
              showCreateStaffModal={showCreateStaffModal}
              setShowCreateStaffModal={setShowCreateStaffModal}
              showAssignStaffModal={showAssignStaffModal}
              setShowAssignStaffModal={setShowAssignStaffModal}
              staffSubTab={staffSubTab}
              setStaffSubTab={setStaffSubTab}
              staffSearchQuery={staffSearchQuery}
              setStaffSearchQuery={setStaffSearchQuery}
              staffFilterEvent={staffFilterEvent}
              setStaffFilterEvent={setStaffFilterEvent}
              staffAccountForm={staffAccountForm}
              setStaffAccountForm={setStaffAccountForm}
              staffAccountLoading={staffAccountLoading}
              handleCreateStaffAccount={handleCreateStaffAccount}
              assignForm={assignForm}
              setAssignForm={setAssignForm}
              assignLoading={assignLoading}
              handleAssignStaff={handleAssignStaff}
              handleToggleStaffStatus={handleToggleStaffStatus}
              handleRemoveStaffAssignment={handleRemoveStaffAssignment}
              editingAssignment={editingAssignment}
              setEditingAssignment={setEditingAssignment}
              editPermissions={editPermissions}
              setEditPermissions={setEditPermissions}
              editLoading={editLoading}
              handleSaveEditedPermissions={handleSaveEditedPermissions}
              handleOpenEditPermissions={handleOpenEditPermissions}
            />
          )}

          {tab === "banners" && (
            <BannersTab
              banners={banners}
              showBannerForm={showBannerForm}
              setShowBannerForm={setShowBannerForm}
              editingBanner={editingBanner}
              setEditingBanner={setEditingBanner}
              bannerForm={bannerForm}
              setBannerForm={setBannerForm}
              bannerImageMode={bannerImageMode}
              setBannerImageMode={setBannerImageMode}
              bannerFile={bannerFile}
              setBannerFile={setBannerFile}
              bannerPreview={bannerPreview}
              setBannerPreview={setBannerPreview}
              bannerSaving={bannerSaving}
              openCreateBanner={openCreateBanner}
              openEditBanner={openEditBanner}
              closeBannerForm={closeBannerForm}
              handleSaveBanner={handleSaveBanner}
              handleToggleBanner={handleToggleBanner}
              handleDeleteBanner={handleDeleteBanner}
            />
          )}

          {tab === "packages" && (
            <PackagesTab
              packages={packages}
              showPackageForm={showPackageForm}
              setShowPackageForm={setShowPackageForm}
              packageForm={packageForm}
              setPackageForm={setPackageForm}
              handleSavePackage={handleSavePackage}
              handleDeletePackage={handleDeletePackage}
            />
          )}

          {tab === "users" && (
            <UsersTab users={users} handleDeleteUser={handleDeleteUser} />
          )}

          {tab === "orders" && <OrdersTab orders={orders} />}
        </main>
      </div>
    </div>
  );
}
