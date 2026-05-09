"use client";

import { ReactNode } from "react";

type Props = {
  index: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
};

export function Field({ index, label, required, hint, children }: Props) {
  return (
    <div className="relative grid grid-cols-[40px_1fr] gap-x-4 gap-y-2 sm:grid-cols-[80px_1fr]">
      {/* index column */}
      <div className="pt-1 select-none">
        <div className="font-bit text-[14px] tracking-widest text-ink/60">
          §{index}
        </div>
        <div className="mt-1 h-px w-full bg-ink/30" />
      </div>

      {/* content column */}
      <div className="min-w-0">
        <label className="block">
          <span className="font-bit text-[18px] uppercase tracking-wide leading-tight">
            {label}
            {required && <span className="ml-1 text-red">*</span>}
          </span>
          {hint && (
            <span className="block mt-0.5 text-[12px] font-bit text-ink/55 normal-case tracking-normal">
              ▸ {hint}
            </span>
          )}
        </label>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
