import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const paymentMethods = [
  { name: "Mandiri", color: "text-blue-700 font-bold" },
  { name: "BCA", color: "text-blue-800 font-black" },
  { name: "Permata", color: "text-emerald-600 font-semibold" },
  { name: "BRI", color: "text-blue-600 font-extrabold" },
  { name: "BNI", color: "text-teal-600 font-extrabold" },
  { name: "BTN", color: "text-amber-600 font-bold" },
  { name: "BSI", color: "text-teal-700 font-bold" },
  { name: "CIMB", color: "text-red-700 font-bold" },
  { name: "VISA", color: "text-blue-700 font-black italic" },
  { name: "Mastercard", color: "text-orange-600 font-black" },
  { name: "ShopeePay", color: "text-orange-500 font-bold" },
  { name: "GoPay", color: "text-sky-500 font-bold" },
  { name: "QRIS", color: "text-red-600 font-extrabold" },
  { name: "LinkAja", color: "text-red-500 font-bold" },
  { name: "Indomaret", color: "text-blue-600 font-bold" },
  { name: "Alfamart", color: "text-red-600 font-bold" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white text-gray-700 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="space-y-4 lg:col-span-1">
            {/* TixGoo Logo */}
            <Link href="/" className="inline-block group">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-2xl font-black tracking-tight text-[#111d5e] flex items-center">
                    <span className="text-blue-600 mr-0.5">✦</span>Tix<span className="text-blue-500">Goo</span>
                  </span>
                </div>
                <span className="text-[7px] tracking-widest uppercase font-bold text-gray-400 -mt-1">
                  LET&apos;S ENJOY THE SHOW
                </span>
              </div>
            </Link>

            <p className="text-xs text-gray-600 leading-relaxed">
              Beli tiket konser, festival, sport event, dan event seru lainnya dengan mudah di LOKÉT. #PASTIBISA beli tiket event &amp; wahana idaman!
            </p>

            <div className="pt-2">
              <h5 className="font-bold text-xs text-gray-900 mb-2">Keamanan dan Privasi</h5>
              {/* ISO / Security badge placeholder */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-gray-300 bg-gray-50 text-[10px] text-gray-600 font-semibold shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>ISO 27001 Certified</span>
              </div>
            </div>
          </div>

          {/* Column 2: Tentang LOKÉT & Produk */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                Tentang LOKÉT
              </h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>
                  <Link href="/" className="hover:text-blue-600 transition-colors">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-blue-600 transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                Produk
              </h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>
                  <Link href="/" className="hover:text-blue-600 transition-colors">
                    LOKET X
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-blue-600 transition-colors">
                    LOKET Screen
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-blue-600 transition-colors">
                    LOKET Pro
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Event Creator */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Event Creator
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Biaya
                </Link>
              </li>
              <li>
                <Link href="/kerjasama" className="hover:text-blue-600 transition-colors">
                  Kerjasama dengan Kami
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Buku Panduan Creator
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  LOKET Crafter
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Dukungan */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Dukungan
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Pusat Bantuan
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Syarat dan Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Kepatuhan Keamanan &amp; Privasi
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Kebijakan Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Pilihan Pembayaran & Social */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Pilihan Pembayaran
            </h4>
            {/* Grid of payment method badges */}
            <div className="grid grid-cols-4 gap-1.5 mb-6">
              {paymentMethods.map((method, idx) => (
                <div
                  key={idx}
                  className="h-6 bg-gray-50 border border-gray-200 rounded flex items-center justify-center p-0.5 hover:bg-gray-100 transition-colors"
                  title={method.name}
                >
                  <span className={`text-[8px] tracking-tighter truncate ${method.color}`}>
                    {method.name}
                  </span>
                </div>
              ))}
            </div>

            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Ikuti Kami untuk Update
            </h4>
            <div className="flex items-center gap-2">
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-7 h-7 rounded-full bg-[#111d5e] text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="#twitter"
                aria-label="Twitter"
                className="w-7 h-7 rounded-full bg-[#111d5e] text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="#tiktok"
                aria-label="TikTok"
                className="w-7 h-7 rounded-full bg-[#111d5e] text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.33 0 .64.06.94.16V9.45a6.38 6.38 0 0 0-.94-.07 6.34 6.34 0 1 0 6.34 6.34V8.76a8.28 8.28 0 0 0 3.76.9V6.69z"/>
                </svg>
              </a>
              <a
                href="#linkedin"
                aria-label="LinkedIn"
                className="w-7 h-7 rounded-full bg-[#111d5e] text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 0 0 1.45-1.45 1.45 1.45 0 0 0-1.45-1.45 1.45 1.45 0 0 0-1.45 1.45c0 .8.65 1.45 1.45 1.45m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
                </svg>
              </a>
              <a
                href="#youtube"
                aria-label="YouTube"
                className="w-7 h-7 rounded-full bg-[#111d5e] text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <p className="text-[11px] text-gray-500 font-medium">
            2026 LOKET (PT Global Loket Sejahtera)
          </p>
        </div>
      </div>
    </footer>
  );
}
