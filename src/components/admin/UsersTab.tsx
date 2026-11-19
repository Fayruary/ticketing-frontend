"use client";

import React, { useState } from "react";
import { Trash2, Search } from "lucide-react";
import {
  UI,
  Table,
  Badge,
  SectionBar,
  Pagination,
  usePagination,
} from "./adminShared";
import type { User as AuthUser } from "@/lib/auth";

interface UsersTabProps {
  users: AuthUser[];
  handleDeleteUser: (id: string) => void;
}

export default function UsersTab({ users, handleDeleteUser }: UsersTabProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  const userPg = usePagination(filteredUsers);

  return (
    <div className="space-y-4">
      <SectionBar
        text={`${users.length} pengguna terdaftar`}
        action={
          <div className="relative w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, email, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#111d5e]"
            />
          </div>
        }
      />

      <Table
        head={[
          { label: "Nama" },
          { label: "Email" },
          { label: "Telepon" },
          { label: "Role" },
          { label: "Aksi", align: "right" },
        ]}
        empty="Belum ada pengguna terdaftar."
        footer={<Pagination {...userPg} onChange={userPg.setPage} inCard />}
      >
        {userPg.pageItems.map((u) => (
          <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
            <td className={UI.td}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#111d5e]/10 text-[#111d5e] text-xs font-bold flex items-center justify-center shrink-0">
                  {u.name?.slice(0, 2).toUpperCase() || "US"}
                </div>
                <span className="font-semibold text-gray-900">{u.name}</span>
              </div>
            </td>
            <td className={UI.td}>{u.email}</td>
            <td className={UI.td}>{u.phone || "-"}</td>
            <td className={UI.td}>
              <Badge
                tone={
                  u.role === "admin"
                    ? "amber"
                    : u.role === "petugas"
                    ? "green"
                    : "blue"
                }
              >
                {u.role === "admin"
                  ? "Admin"
                  : u.role === "petugas"
                  ? "Petugas"
                  : "Pengguna"}
              </Badge>
            </td>
            <td className={`${UI.td} text-right`}>
              {u.role !== "admin" && (
                <button
                  onClick={() => handleDeleteUser(u.id)}
                  className={UI.iconBtnDanger}
                  title="Hapus Akun Pengguna"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

