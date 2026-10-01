import React from "react";

interface SpotlightBannerProps {
  className?: string;
}

export default function SpotlightBanner({ className = "" }: SpotlightBannerProps) {
  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      <div   className="w-full rounded-2xl overflow-hidden shadow-sm">
        <img src="/spotlight.png" alt="Loket Spotlight Banner" 
                  className="w-full h-auto object-cover" />
      </div>
    </section>
  );
}