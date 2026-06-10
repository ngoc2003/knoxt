import {
  Check,
  ChevronRight,
  FileText,
  FolderKanban,
  Share2,
  Users,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { ScrollReveal } from "./LandingMotion";

export function ProductPreview() {
  return (
    <ScrollReveal className="relative mx-auto mt-16 max-w-6xl" delay={0.16}>
      <div className="absolute -inset-8 -z-10 rounded-[40px] bg-[#8d75f2]/25 blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50">
        <div className="flex h-12 items-center gap-2 border-b border-slate-200 px-4">
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
          <div className="mx-auto flex h-7 w-64 items-center justify-center rounded-md bg-slate-100 text-[11px] text-slate-500">
            workspace.knoxt.io
          </div>
        </div>
        <div className="grid min-h-[430px] grid-cols-[180px_1fr] sm:grid-cols-[230px_1fr]">
          <aside className="border-r border-slate-200 bg-slate-50/80 p-4">
            <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-700">
              <FolderKanban className="size-4 text-[#4f2fdf]" />
              Atlas redesign
            </div>
            <div className="space-y-1.5 text-xs text-slate-500">
              <PreviewTreeItem label="Project brief" />
              <PreviewTreeItem label="Requirements" active />
              <div className="pl-5">
                <PreviewTreeItem label="Authentication" />
                <PreviewTreeItem label="Permissions" />
              </div>
              <PreviewTreeItem label="Meeting notes" />
              <PreviewTreeItem label="Handover" />
            </div>
          </aside>
          <div className="min-w-0 p-6 sm:p-10">
            <div className="mb-8 flex items-center gap-2 text-xs text-slate-500">
              Projects <ChevronRight className="size-3" /> Atlas redesign{" "}
              <ChevronRight className="size-3" /> Requirements
            </div>
            <div className="max-w-2xl">
              <div className="mb-4 flex gap-2">
                <Badge className="bg-[#f1edff] text-[#4124c7] hover:bg-[#f1edff]">
                  requirements
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-600"
                >
                  updated today
                </Badge>
              </div>
              <p className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Authentication requirements
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                The platform must support secure account access and preserve the
                context behind each permission decision.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  "Email and password authentication",
                  "Project roles: viewer, editor, and admin",
                  "Revocable public links for selected documents",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-xs text-slate-700 sm:text-sm"
                  >
                    <span className="flex size-5 items-center justify-center rounded bg-emerald-50 text-emerald-600">
                      <Check className="size-3" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

function PreviewTreeItem({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-2 py-2 ${
        active ? "bg-[#e8e2ff] text-[#4124c7]" : ""
      }`}
    >
      <FileText className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

export function SharingPreview() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur sm:p-6">
      <div className="rounded-xl bg-white p-5 text-slate-950">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="font-semibold">Share project knowledge</p>
            <p className="mt-1 text-xs text-slate-500">Atlas redesign</p>
          </div>
          <Share2 className="size-5 text-[#4f2fdf]" />
        </div>
        <div className="mt-5 space-y-3">
          {[
            ["MC", "Mina Chen", "Admin"],
            ["JL", "Jordan Lee", "Editor"],
            ["AK", "Alex Kim", "Viewer"],
          ].map(([initials, name, role]) => (
            <div
              key={name}
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-[#f1edff] text-xs font-semibold text-[#4124c7]">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{name}</p>
                <p className="text-xs text-slate-500">{role}</p>
              </div>
              <Users className="size-4 text-slate-300" />
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between rounded-lg bg-slate-50 p-3">
          <div>
            <p className="text-sm font-medium">Public read-only link</p>
            <p className="text-xs text-slate-500">Can be revoked anytime</p>
          </div>
          <span className="h-5 w-9 rounded-full bg-[#4f2fdf] p-0.5">
            <span className="ml-auto block size-4 rounded-full bg-white" />
          </span>
        </div>
      </div>
    </div>
  );
}
