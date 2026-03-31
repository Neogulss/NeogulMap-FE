import React from "react";
import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-[#a3a3a3] px-10 py-12 text-xs">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-2 text-white text-lg font-bold">
            <span className="text-xl">🦝</span>
            <span>입지너구리</span>
          </div>

          <div className="text-right">
            <p className="text-white mb-1">고객센터</p>
            <p className="text-white text-2xl font-bold mb-2">1588-0000</p>
            <p className="text-white">
              평일 09:00 - 18:00 (점심시간 12:00 - 13:00)
            </p>
            <p className="text-white">주말 및 공휴일 휴무</p>
          </div>
        </div>

        <div className="border-t border-[#333] pt-8 flex justify-between items-center">
          <div className="text-[#666]">
            © 2026 IPJI-NEOGURI Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
