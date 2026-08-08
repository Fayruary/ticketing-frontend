"use client";

import type {
  InputHTMLAttributes,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({
  label,
  ...props
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium">
          {label}
        </label>
      )}

      <input
        {...props}
        className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 ${
          props.className || ""
        }`}
      />
    </div>
  );
}