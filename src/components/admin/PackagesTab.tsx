"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  UI,
  Field,
  FormPanel,
  SectionBar,
  Pagination,
  usePagination,
  RupiahInput,
} from "./adminShared";
import { formatRupiah } from "@/lib/utils";
import type { CooperationPackage } from "@/services/packageService";

interface PackagesTabProps {
  packages: CooperationPackage[];
  showPackageForm: boolean;
  setShowPackageForm: (show: boolean) => void;
  packageForm: Partial<CooperationPackage>;
  setPackageForm: React.Dispatch<React.SetStateAction<Partial<CooperationPackage>>>;
  handleSavePackage: () => void;
  handleDeletePackage: (id: number) => void;
}

export default function PackagesTab({
  packages,
  showPackageForm,
  setShowPackageForm,
  packageForm,
  setPackageForm,
  handleSavePackage,
  handleDeletePackage,
}: PackagesTabProps) {
  const packagePg = usePagination(packages);

  return (
    <div className="space-y-6">
      <SectionBar
        text={`${packages.length} paket kerja sama EO`}
        action={
          <button
            onClick={() => setShowPackageForm(!showPackageForm)}
            className={UI.btn}
          >
            <Plus className="w-4 h-4" /> Tambah Paket
          </button>
        }
      />

      {showPackageForm && (
        <FormPanel
          title="Paket Kerja Sama Baru"
          onClose={() => setShowPackageForm(false)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "name", label: "Nama Paket", type: "text" },
              { key: "duration", label: "Durasi (contoh: 1 bulan)", type: "text" },
              { key: "price", label: "Harga (Rp)", type: "number" },
            ].map(({ key, label, type }) => (
              <Field key={key} label={label}>
                {key === "price" ? (
                  <RupiahInput
                    value={packageForm.price}
                    onChange={(n) => setPackageForm({ ...packageForm, price: n })}
                  />
                ) : (
                  <input
                    type={type}
                    value={(packageForm as any)[key] || ""}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, [key]: e.target.value })
                    }
                    className={UI.input}
                  />
                )}
              </Field>
            ))}
            <Field label="Deskripsi Paket" className="sm:col-span-2">
              <textarea
                rows={2}
                value={packageForm.description || ""}
                onChange={(e) =>
                  setPackageForm({ ...packageForm, description: e.target.value })
                }
                className={`${UI.input} resize-none`}
              />
            </Field>
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={handleSavePackage} className={UI.btn}>
              Simpan Paket
            </button>
            <button
              onClick={() => setShowPackageForm(false)}
              className={UI.btnGhost}
            >
              Batal
            </button>
          </div>
        </FormPanel>
      )}

      {packages.length === 0 ? (
        <p className={`${UI.card} text-sm text-gray-500 text-center py-10`}>
          Belum ada paket kerja sama yang terdaftar.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {packagePg.pageItems.map((pkg) => (
              <div
                key={pkg.id}
                className={`${UI.card} p-5 flex flex-col border-t-[3px] border-t-[#111d5e] shadow-2xs hover:shadow-xs transition-shadow`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-gray-900">{pkg.name}</h4>
                    <p className="text-xs text-gray-500 font-semibold">{pkg.duration}</p>
                  </div>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className={UI.iconBtnDanger}
                    title="Hapus Paket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xl font-black text-[#111d5e] mt-4 tabular-nums">
                  {formatRupiah(pkg.price)}
                </p>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {pkg.description || "-"}
                </p>
              </div>
            ))}
          </div>
          <Pagination {...packagePg} onChange={packagePg.setPage} />
        </>
      )}
    </div>
  );
}

