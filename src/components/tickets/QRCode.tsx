import React from "react";

interface QRCodeProps {
  value: string;
  size?: number;
}

// Generates an aesthetic SVG QR code visual for ticket codes
export default function QRCode({ value, size = 180 }: QRCodeProps) {
  // Simple deterministic pattern based on hash of string for SVG display
  const hash = Array.from(value || "TICKETIFY").reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007,
    0
  );

  const gridSize = 15;
  const rects = [];

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Corner finder patterns
      const isTopLeft = r < 4 && c < 4;
      const isTopRight = r < 4 && c >= gridSize - 4;
      const isBottomLeft = r >= gridSize - 4 && c < 4;

      if (isTopLeft || isTopRight || isBottomLeft) continue;

      const seed = (r * gridSize + c + hash) % 17;
      if (seed > 7) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c * 10}
            y={r * 10}
            width="8.5"
            height="8.5"
            rx="1.5"
            className="fill-zinc-900"
          />
        );
      }
    }
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl border border-zinc-200"
    >
      <svg
        viewBox="0 0 150 150"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Finder pattern Top-Left */}
        <rect x="0" y="0" width="40" height="40" rx="6" fill="#18181b" />
        <rect x="6" y="6" width="28" height="28" rx="4" fill="#ffffff" />
        <rect x="12" y="12" width="16" height="16" rx="2" fill="#8b5cf6" />

        {/* Finder pattern Top-Right */}
        <rect x="110" y="0" width="40" height="40" rx="6" fill="#18181b" />
        <rect x="116" y="6" width="28" height="28" rx="4" fill="#ffffff" />
        <rect x="122" y="12" width="16" height="16" rx="2" fill="#8b5cf6" />

        {/* Finder pattern Bottom-Left */}
        <rect x="0" y="110" width="40" height="40" rx="6" fill="#18181b" />
        <rect x="6" y="116" width="28" height="28" rx="4" fill="#ffffff" />
        <rect x="12" y="122" width="16" height="16" rx="2" fill="#8b5cf6" />

        {/* Data Cells */}
        {rects}
      </svg>
    </div>
  );
}
