/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from "react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-white">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-blue-200 border-t-transparent animate-spin-slow"></div>
          <div className="absolute inset-4 rounded-full border-2 border-blue-300 border-t-transparent animate-spin-reverse"></div>
        </div>
        <div className="text-xl font-semibold text-blue-700 animate-pulse">
          Loading...
        </div>
      </div>
    </div>
  );
}
