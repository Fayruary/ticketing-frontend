import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import TrendingRow from "@/components/home/TrendingRow";
import SpotlightBanner from "@/components/home/SpotlightBanner";
import CategorySection from "@/components/home/CategorySection";
import EventGridSection from "@/components/home/EventGridSection";

export const metadata = {
  title: "TixGoo - Beli Tiket Event, Konser & Wahana Idaman",
  description:
    "Beli tiket konser, festival, sport event, dan event seru lainnya dengan mudah di LOKET. #PASTIBISA beli tiket event & wahana idaman!",
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header / Navigation Component */}
      <Navbar />

      <main className="flex-1 w-full space-y-2">
        {/* Hero Banner Carousel Component */}
        <HeroBanner />

        {/* First 'Lagi Trending' Section (Row of Featured Cards) */}
        <TrendingRow />

        {/* Promotional 'LOKÉT SPOTLIGHT' Banner Component */}
        <SpotlightBanner />

        {/* 'Kategori' Selection Grid Component */}
        <CategorySection />

        {/* Second 'Lagi Trending' Section (3x4 Grid of 12 Cards + 'Lihat Semua' Button) */}
        <EventGridSection />
      </main>

      {/* Multi-Column Footer Component */}
      <Footer />
    </div>
  );
}
