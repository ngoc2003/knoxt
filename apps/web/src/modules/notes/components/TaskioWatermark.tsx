import type { ReactNode } from "react";

export function TaskioWatermark({
  label,
  badge,
  mode = "absolute",
  children,
  contentClassName = "",
}: {
  label: string;
  badge?: string;
  mode?: "absolute" | "fixed";
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div
        className={`pointer-events-none ${mode} inset-0 z-0 flex items-center justify-center overflow-hidden`}
        aria-hidden="true"
      >
        <div className="-rotate-12 select-none text-center text-indigo-500/[0.08]">
          <p className="text-8xl font-black tracking-[0.18em]">TASKIO</p>
          <p className="mt-3 text-xl font-semibold tracking-[0.3em]">{label}</p>
        </div>
      </div>
      <div className={`relative z-10 ${contentClassName}`}>
        {badge && (
          <div className="mb-5 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {badge}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
