import React from "react";
import { Image as ImageIcon } from "lucide-react";

interface PlaceholderBoxProps {
  className?: string;
  label?: string;
  sublabel?: string;
  aspectRatio?: string;
  height?: string;
  width?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export default function PlaceholderBox({
  className = "",
  label,
  sublabel,
  aspectRatio,
  height,
  width = "w-full",
  showIcon = true,
  children,
}: PlaceholderBoxProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-neutral-200 border border-neutral-300 flex flex-col items-center justify-center text-neutral-400 select-none ${width} ${height || ""} ${aspectRatio || ""} ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
        backgroundSize: "16px 16px",
      }}
    >
      {/* Background neutral placeholder state */}
      {children ? (
        children
      ) : (
        <div className="flex flex-col items-center justify-center p-3 text-center pointer-events-none">
          {showIcon && <ImageIcon className="w-8 h-8 mb-1.5 text-neutral-400" />}
          {label && (
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-[10px] text-neutral-400 mt-0.5">{sublabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
