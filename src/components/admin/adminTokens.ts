export const ADMIN_UI = {
  card: "bg-white rounded-2xl border border-gray-100 shadow-xs",
  input:
    "w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#111d5e] focus:border-transparent transition-all",
  label: "block text-xs font-bold text-gray-700 mb-1.5",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#111d5e] hover:bg-[#0c1543] active:scale-95 transition-all shadow-xs cursor-pointer",
  btnPrimarySm:
    "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#111d5e] hover:bg-[#0c1543] active:scale-95 transition-all shadow-xs cursor-pointer",
  btnSecondary:
    "inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer",
  btnSecondarySm:
    "inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer",
  iconBtnDanger:
    "p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer",
  iconBtnNeutral:
    "p-2 rounded-lg text-gray-400 hover:text-[#111d5e] hover:bg-blue-50 transition-colors cursor-pointer",
  th: "px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide",
  badgeBase: "inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
  badgeGreen: "bg-emerald-50 text-emerald-700 border-emerald-100",
  badgeAmber: "bg-amber-50 text-amber-700 border-amber-100",
  badgeRed: "bg-red-50 text-red-600 border-red-100",
  badgeBlue: "bg-blue-50 text-blue-700 border-blue-100",
  badgeGray: "bg-gray-100 text-gray-600 border-gray-200",
};

export type AdminTab =
  | "overview"
  | "events"
  | "banners"
  | "packages"
  | "users"
  | "staff"
  | "orders";

