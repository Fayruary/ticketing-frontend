import React from "react";
import {
  Music,
  Image as ImageIcon,
  Tent,
  Theater,
  Trophy,
  Mic,
  Presentation,
  Compass,
  Landmark,
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const categories: CategoryItem[] = [
  { id: "musik", name: "Musik", icon: <Music className="w-6 h-6 text-blue-600" /> },
  { id: "pameran", name: "Pameran", icon: <ImageIcon className="w-6 h-6 text-blue-600" /> },
  { id: "wahana", name: "Wahana", icon: <Tent className="w-6 h-6 text-blue-600" /> },
  { id: "teater", name: "Teater", icon: <Theater className="w-6 h-6 text-blue-600" /> },
  { id: "olahraga", name: "Olahraga", icon: <Compass className="w-6 h-6 text-blue-600" /> },
  { id: "wisata", name: "Wisata", icon: <Landmark className="w-6 h-6 text-blue-600" /> },
  { id: "talkshow", name: "Talkshow", icon: <Mic className="w-6 h-6 text-blue-600" /> },
  { id: "workshop", name: "Workshop", icon: <Presentation className="w-6 h-6 text-blue-600" /> },
  { id: "kompetisi", name: "Kompetisi", icon: <Trophy className="w-6 h-6 text-blue-600" /> },
];

interface CategorySectionProps {
  className?: string;
}

export default function CategorySection({ className = "" }: CategorySectionProps) {
  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-6">
        Kategori
      </h2>

      {/* Grid / Horizontal Row of 9 Categories */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-4 items-center justify-items-center">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="group flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors w-full focus:outline-none"
          >
            {/* Category Icon Container */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-50/70 border border-blue-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-200">
              {cat.icon}
            </div>
            {/* Category Label */}
            <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition-colors text-center">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
