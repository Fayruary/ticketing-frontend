"use client";

import React, { Suspense } from "react";
import AuthSlider from "@/components/auth/AuthSlider";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-xs font-semibold text-gray-500">
          Memuat...
        </div>
      }
    >
      <AuthSlider initialMode="register" />
    </Suspense>
  );
}
