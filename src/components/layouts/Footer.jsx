import React from "react";
import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="bg-[#121415] text-neutral-5 px-10 pb-4 pt-6 text-b-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2 text-lg font-bold text-neutral-2">
            <img
            src="src/assets/images/logo.svg"
            alt="입지너구리 로고"
            className="object-contain w-auto h-8 rounded-full bg-neutral-2 "
          />
            <span>입지너구리</span>
          </div>

          <div className="text-right">
            <p className="mb-1 text-neutral-2">고객센터</p>
            <p className="mb-2 text-neutral-2 text-h-6">1588-0000</p>
            <p className="text-neutral-2">
              평일 09:00 - 18:00 (점심시간 12:00 - 13:00)
            </p>
            <p className="text-neutral-2 ">주말 및 공휴일 휴무</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-neutral-9">
          <div className="text-neutral-5">
            © 2026 IPJI-NEOGURI Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
