"use client";

import React from "react";
import {
  ImageIcon,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Link as LinkIcon,
} from "lucide-react";
import {
  UI,
  Field,
  FormPanel,
  SectionBar,
  Pagination,
  usePagination,
  FALLBACK_IMG,
} from "./adminShared";
import { resolveBannerImageUrl, type Banner } from "@/services/bannerService";

interface BannersTabProps {
  banners: Banner[];
  showBannerForm: boolean;
  setShowBannerForm: (show: boolean) => void;
  editingBanner: Banner | null;
  setEditingBanner: (banner: Banner | null) => void;
  bannerForm: Partial<Banner>;
  setBannerForm: React.Dispatch<React.SetStateAction<Partial<Banner>>>;
  bannerImageMode: "file" | "url";
  setBannerImageMode: (mode: "file" | "url") => void;
  bannerFile: File | null;
  setBannerFile: (f: File | null) => void;
  bannerPreview: string;
  setBannerPreview: (s: string) => void;
  bannerSaving: boolean;
  openCreateBanner: () => void;
  openEditBanner: (b: Banner) => void;
  closeBannerForm: () => void;
  handleSaveBanner: () => void;
  handleToggleBanner: (id: number | string) => void;
  handleDeleteBanner: (id: number | string) => void;
}

export default function BannersTab({
  banners,
  showBannerForm,
  editingBanner,
  bannerForm,
  setBannerForm,
  bannerImageMode,
  setBannerImageMode,
  bannerFile,
  setBannerFile,
  bannerPreview,
  setBannerPreview,
  bannerSaving,
  openCreateBanner,
  openEditBanner,
  closeBannerForm,
  handleSaveBanner,
  handleToggleBanner,
  handleDeleteBanner,
}: BannersTabProps) {
  const bannerPg = usePagination(banners);
  const activeBanners = banners.filter((b) => b.is_active).length;

  return (
    <div className="space-y-6">
      <SectionBar
        text={`${banners.length} banner terdaftar, ${activeBanners} aktif di homepage beranda`}
        action={
          <button onClick={openCreateBanner} className={UI.btn}>
            <Plus className="w-4 h-4" /> Tambah Banner
          </button>
        }
      />

      {showBannerForm && (
        <FormPanel
          title={editingBanner?.id ? "Edit Banner Promo" : "Banner Promo Baru"}
          onClose={closeBannerForm}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <Field label="Judul Banner Promo">
                <input
                  type="text"
                  value={bannerForm.title || ""}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, title: e.target.value })
                  }
                  placeholder="Contoh: Sheila On 7 Tunggu Aku Di Jakarta 2026"
                  className={UI.input}
                />
              </Field>

              <Field label="Link Tujuan / Rute">
                <input
                  type="text"
                  value={bannerForm.link_url || ""}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, link_url: e.target.value })
                  }
                  placeholder="/events atau https://..."
                  className={UI.input}
                />
                <p className={UI.hint}>Halaman yang dibuka saat banner diklik pengguna.</p>
              </Field>

              <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bannerForm.is_active !== false}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, is_active: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-[#111d5e] focus:ring-[#111d5e]"
                />
                <span>Tampilkan Banner di Beranda (Aktif)</span>
              </label>

              <div>
                <span className={UI.label}>Pilihan Sumber Gambar</span>
                <div className="inline-flex p-0.5 bg-gray-100 rounded-lg mb-3">
                  {(
                    [
                      ["file", "Upload File", Upload],
                      ["url", "Pakai Link URL", LinkIcon],
                    ] as const
                  ).map(([mode, text, Icon]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setBannerImageMode(mode)}
                      className={`px-3 py-1.5 rounded-md text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
                        bannerImageMode === mode
                          ? "bg-white text-gray-900 font-bold shadow-2xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {text}
                    </button>
                  ))}
                </div>

                {bannerImageMode === "file" ? (
                  <>
                    <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#111d5e] hover:bg-gray-50 transition-colors">
                      <Upload className="w-5 h-5 text-gray-400 mb-1.5" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">
                        {bannerFile ? bannerFile.name : "Pilih gambar dari perangkat"}
                      </span>
                      <span className="text-[11px] text-gray-400 mt-0.5">
                        PNG, JPG, atau WEBP, maks. 10 MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBannerFile(file);
                            setBannerPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                    {bannerFile && (
                      <p className="text-xs text-gray-500 mt-1.5">
                        Ukuran file: {(bannerFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      type="url"
                      value={bannerForm.image || ""}
                      onChange={(e) => {
                        setBannerForm({ ...bannerForm, image: e.target.value });
                        setBannerPreview(e.target.value);
                      }}
                      className={UI.input}
                      placeholder="https://..."
                    />
                    <p className={UI.hint}>Tempel tautan langsung ke file gambar online.</p>
                  </>
                )}
              </div>
            </div>

            {/* Live Preview */}
            <div className="lg:col-span-2">
              <span className={UI.label}>Pratinjau Banner</span>
              <div className="relative aspect-[16/10] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                {bannerPreview ? (
                  <>
                    <img
                      src={bannerPreview}
                      alt="Pratinjau banner"
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src = FALLBACK_IMG;
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-black/65 text-white">
                      <p className="text-xs sm:text-sm font-bold line-clamp-1">
                        {bannerForm.title || "Judul banner"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-400 p-4">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1.5 opacity-60" />
                    <p className="text-xs font-semibold">Belum ada gambar terpilih</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6 pt-5 border-t border-gray-100">
            <button
              onClick={handleSaveBanner}
              disabled={bannerSaving}
              className={UI.btn}
            >
              {bannerSaving
                ? "Menyimpan..."
                : editingBanner?.id
                ? "Simpan Perubahan"
                : "Simpan Banner"}
            </button>
            <button
              onClick={closeBannerForm}
              disabled={bannerSaving}
              className={UI.btnGhost}
            >
              Batal
            </button>
          </div>
        </FormPanel>
      )}

      {banners.length === 0 ? (
        <div className={`${UI.card} py-14 text-center`}>
          <ImageIcon className="w-8 h-8 mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-bold text-gray-900">Belum ada banner promo</p>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Banner aktif akan tampil bergiliran di hero slider beranda.
          </p>
          <button onClick={openCreateBanner} className={UI.btn}>
            <Plus className="w-4 h-4" /> Tambah Banner
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bannerPg.pageItems.map((banner) => (
              <article
                key={banner.id}
                className={`${UI.card} overflow-hidden flex flex-col group hover:shadow-md transition-shadow`}
              >
                <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                  <img
                    src={resolveBannerImageUrl(banner.image || banner.image_url)}
                    alt={banner.title}
                    className={`w-full h-full object-cover transition-transform group-hover:scale-105 duration-300 ${
                      banner.is_active ? "" : "grayscale opacity-60"
                    }`}
                    onError={(e: any) => {
                      e.target.src = FALLBACK_IMG;
                    }}
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-2">
                      {banner.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {banner.link_url || "/events"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleToggleBanner(banner.id)}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer"
                      title={banner.is_active ? "Nonaktifkan" : "Aktifkan"}
                      role="switch"
                      aria-checked={!!banner.is_active}
                    >
                      <span
                        className={`relative w-8 h-[18px] rounded-full transition-colors ${
                          banner.is_active ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform ${
                            banner.is_active ? "translate-x-[14px]" : ""
                          }`}
                        />
                      </span>
                      {banner.is_active ? "Aktif" : "Nonaktif"}
                    </button>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => openEditBanner(banner)}
                        className={UI.iconBtn}
                        title="Edit Banner"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className={UI.iconBtnDanger}
                        title="Hapus Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Pagination {...bannerPg} onChange={bannerPg.setPage} />
        </>
      )}
    </div>
  );
}

