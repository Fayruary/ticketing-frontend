"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { getPetugasDashboard, type PetugasDashboard } from "@/services/dashboardService";
import { getMyAssignedEvents, type AssignedEvent } from "@/services/staffService";
import { getTicketCategories, type TicketCategory } from "@/services/ticketService";
import { getEventCheckins } from "@/services/checkinService";
import { getEventOfflineSales, type OfflineSale } from "@/services/offlineSaleService";
import { AlertCircle } from "lucide-react";

import PetugasHeader, { type PetugasTab } from "@/components/petugas/PetugasHeader";
import PetugasEventBanner from "@/components/petugas/PetugasEventBanner";
import PetugasDashboardTab from "@/components/petugas/PetugasDashboardTab";
import PetugasCheckinTab from "@/components/petugas/PetugasCheckinTab";
import PetugasVisitorsTab from "@/components/petugas/PetugasVisitorsTab";
import PetugasOfflineTab from "@/components/petugas/PetugasOfflineTab";

export default function PetugasPage() {
  const router = useRouter();
  const { user, isAuthenticated, role, loading: authLoading, logout } = useAuth();

  const [tab, setTab] = useState<PetugasTab>("dashboard");

  // Data Penugasan & Event
  const [assignedEvents, setAssignedEvents] = useState<AssignedEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [dashboard, setDashboard] = useState<PetugasDashboard | null>(null);
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [checkinHistory, setCheckinHistory] = useState<any[]>([]);
  const [offlineSales, setOfflineSales] = useState<OfflineSale[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== "petugas")) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, role, router]);

  // Load Initial Assigned Events
  const fetchInitialAssignedEvents = useCallback(async () => {
    try {
      setLoading(true);
      const eventsList = await getMyAssignedEvents();
      setAssignedEvents(eventsList);

      if (eventsList.length > 0) {
        const firstId = eventsList[0].id || (eventsList[0] as any).event_id;
        setSelectedEventId((prev) =>
          prev && eventsList.some((e) => e.id === prev || (e as any).event_id === prev)
            ? prev
            : firstId
        );
      } else {
        setSelectedEventId("");
      }
    } catch (err) {
      console.error("Error loading assigned events:", err);
      setAssignedEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && role === "petugas") {
      fetchInitialAssignedEvents();
    }
  }, [isAuthenticated, role, fetchInitialAssignedEvents]);

  // Fetch Event Data
  const fetchEventData = useCallback(async (eventId: string) => {
    const evt = assignedEvents.find(
      (e) => e.id === eventId || (e as any).event_id === eventId
    );
    const perms = evt?.permissions || [];

    setDashboard(null);
    setCheckinHistory([]);
    setOfflineSales([]);
    setTicketCategories([]);

    try {
      setRefreshing(true);
      const promises: Promise<any>[] = [];

      // 1. Dashboard (jika punya izin view_reports)
      if (perms.includes("view_reports")) {
        promises.push(
          getPetugasDashboard(eventId)
            .then((res) => setDashboard(res))
            .catch(() => setDashboard(null))
        );
      }

      // 2. Kategori tiket & offline sales (jika punya izin offline_sales)
      if (perms.includes("offline_sales")) {
        promises.push(
          getTicketCategories(eventId)
            .then((res: any) => setTicketCategories(Array.isArray(res) ? res : res?.data || []))
            .catch(() => setTicketCategories([]))
        );
        promises.push(
          getEventOfflineSales(eventId)
            .then((res) => setOfflineSales(Array.isArray(res) ? res : []))
            .catch(() => setOfflineSales([]))
        );
      }

      // 3. Riwayat check-in (jika punya izin view_visitors)
      if (perms.includes("view_visitors")) {
        promises.push(
          getEventCheckins(eventId)
            .then((res: any) => setCheckinHistory(Array.isArray(res) ? res : res?.data || []))
            .catch(() => setCheckinHistory([]))
        );
      }

      await Promise.allSettled(promises);
    } catch (err) {
      console.error("Error loading event data:", err);
    } finally {
      setRefreshing(false);
    }
  }, [assignedEvents]);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventData(selectedEventId);
    }
  }, [selectedEventId, fetchEventData]);

  // Permissions
  const selectedEvent = assignedEvents.find(
    (e) => e.id === selectedEventId || (e as any).event_id === selectedEventId
  );
  const currentPermissions: string[] = selectedEvent?.permissions || [];
  const canCheckin = currentPermissions.includes("checkin");
  const canOfflineSales = currentPermissions.includes("offline_sales");
  const canViewVisitors = currentPermissions.includes("view_visitors");
  const canViewReports = currentPermissions.includes("view_reports");

  // Tab auto-adjust based on permissions
  useEffect(() => {
    if (!selectedEvent) return;

    if (tab === "dashboard" && !canViewReports) {
      if (canCheckin) setTab("checkin");
      else if (canViewVisitors) setTab("visitors");
      else if (canOfflineSales) setTab("offline");
    } else if (tab === "checkin" && !canCheckin) {
      if (canViewReports) setTab("dashboard");
      else if (canViewVisitors) setTab("visitors");
      else if (canOfflineSales) setTab("offline");
    } else if (tab === "visitors" && !canViewVisitors) {
      if (canViewReports) setTab("dashboard");
      else if (canCheckin) setTab("checkin");
      else if (canOfflineSales) setTab("offline");
    } else if (tab === "offline" && !canOfflineSales) {
      if (canViewReports) setTab("dashboard");
      else if (canCheckin) setTab("checkin");
      else if (canViewVisitors) setTab("visitors");
    }
  }, [tab, selectedEvent, canViewReports, canCheckin, canViewVisitors, canOfflineSales]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#111d5e] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Memuat Portal Petugas...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || role !== "petugas") return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Header & Tabs */}
      <PetugasHeader
        user={user}
        tab={tab}
        setTab={setTab}
        assignedEvents={assignedEvents}
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
        refreshing={refreshing}
        canCheckin={canCheckin}
        canOfflineSales={canOfflineSales}
        canViewVisitors={canViewVisitors}
        canViewReports={canViewReports}
        logout={logout}
        onLogoutRedirect={() => router.push("/")}
      />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* State Kosong Jika Belum Ada Penugasan Event */}
        {assignedEvents.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-gray-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-lg text-gray-900">Belum Ada Penugasan Event</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                Akun petugas Anda belum ditugaskan pada event apa pun oleh Administrator. Silakan hubungi koordinator event atau admin tiket.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Active Event Banner & Permissions */}
            <PetugasEventBanner
              selectedEvent={selectedEvent}
              canCheckin={canCheckin}
              canOfflineSales={canOfflineSales}
              canViewVisitors={canViewVisitors}
              canViewReports={canViewReports}
            />

            {/* TAB CONTENT */}
            {tab === "dashboard" && (
              <PetugasDashboardTab
                canViewReports={canViewReports}
                dashboard={dashboard}
              />
            )}

            {tab === "checkin" && (
              <PetugasCheckinTab
                canCheckin={canCheckin}
                selectedEventId={selectedEventId}
                onCheckinSuccess={() => {
                  if (selectedEventId) fetchEventData(selectedEventId);
                }}
              />
            )}

            {tab === "visitors" && (
              <PetugasVisitorsTab
                canViewVisitors={canViewVisitors}
                checkinHistory={checkinHistory}
                onRefresh={() => {
                  if (selectedEventId) fetchEventData(selectedEventId);
                }}
                refreshing={refreshing}
              />
            )}

            {tab === "offline" && (
              <PetugasOfflineTab
                canOfflineSales={canOfflineSales}
                selectedEventId={selectedEventId}
                ticketCategories={ticketCategories}
                offlineSales={offlineSales}
                onSaleSuccess={() => {
                  if (selectedEventId) fetchEventData(selectedEventId);
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
