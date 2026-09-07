import React from "react";
import Link from "next/link";
import { Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-extrabold text-2xl tracking-tight text-black">LOGO</span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed pr-4">
              Beli tiket konser, festival, sport event, dan event seru lainnya dengan mudah di LOKET. #PASTIBISA beli tiket event & wahana idaman!
            </p>
            <div className="pt-4">
              <h5 className="font-bold text-sm text-gray-900 mb-2">Keamanan dan Privasi</h5>
              <div className="w-24 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-400">CERTIFIED</span>
              </div>
            </div>
          </div>

          {/* Quick Links 1 */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">Tentang LOKET</h4>
            <ul className="space-y-3 text-xs">
              <li><Link href="/" className="hover:text-[#111d5e] transition-colors">Tentang Kami</Link></li>
              <li><Link href="/" className="hover:text-[#111d5e] transition-colors">Blog</Link></li>
            </ul>

            <h4 className="text-sm font-bold text-gray-900 mt-6 mb-4">Produk</h4>
            <ul className="space-y-3 text-xs">
              <li><Link href="/" className="hover:text-[#111d5e] transition-colors">LOKET X</Link></li>
              <li><Link href="/" className="hover:text-[#111d5e] transition-colors">LOKET Screen</Link></li>
              <li><Link href="/" className="hover:text-[#111d5e] transition-colors">LOKET Pro</Link></li>
            </ul>
          </div>

          {/* Quick Links 2 */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">Event Creator</h4>
            <ul className="space-y-3 text-xs">
              <li><Link href="/" className="hover:text-[#111d5e] transition-colors">Biaya</Link></li>
              <li><Link href="/kerjasama" className="hover:text-[#111d5e] transition-colors">Kerjasama dengan Kami</Link></li>
              <li><Link href="/" className="hover:text-[#111d5e] transition-colors">Buku Panduan Creator</Link></li>
              <li><Link href="/" className="hover:text-[#111d5e] transition-colors">LOKET Crafter</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">Dukungan</h4>
            <ul className="space-y-3 text-xs">
              <li><Link href="/" className="hover:text-[#111d5e] transition-colors">Pusat Bantuan</Link></li>
              <li><Link href="/" className="hover:text-[#111d5e] transition-colors">Syarat dan Ketentuan</Link></li>
              <li><Link href="/" className="hover:text-[#111d5e] transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="/" className="hover:text-[#111d5e] transition-colors">Kepatuhan Keamanan & Privasi</Link></li>
              <li><Link href="/" className="hover:text-[#111d5e] transition-colors">Kebijakan Cookies</Link></li>
            </ul>
          </div>

          {/* Payments & Social */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">Pilihan Pembayaran</h4>
            <div className="grid grid-cols-4 gap-2 mb-8">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                <div key={n} className="h-6 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                  <span className="text-[8px] text-gray-400 font-bold">BANK</span>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-bold text-gray-900 mb-4">Ikuti Kami untuk Update</h4>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-[#111d5e] text-white flex items-center justify-center hover:bg-[#0c1543] transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#111d5e] text-white flex items-center justify-center hover:bg-[#0c1543] transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#111d5e] text-white flex items-center justify-center hover:bg-[#0c1543] transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#111d5e] text-white flex items-center justify-center hover:bg-[#0c1543] transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#111d5e] text-white flex items-center justify-center hover:bg-[#0c1543] transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-[10px] text-gray-500">
            2026 LOKET (PT Global Loket Sejahtera)
          </p>
        </div>
      </div>
    </footer>
  );
}
