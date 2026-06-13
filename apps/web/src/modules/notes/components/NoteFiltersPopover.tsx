import { useState } from "react";
import { ChevronDown, Filter, RotateCcw } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { NoteTag } from "../types/note";

export function NoteFiltersPopover({
  scope,
  tagId,
  projects,
  tags,
  onScopeChange,
  onTagChange,
}: {
  scope: string;
  tagId: string;
  projects: { id: string; name: string }[];
  tags: NoteTag[];
  onScopeChange: (scope: string) => void;
  onTagChange: (tagId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = Number(scope !== "all") + Number(tagId !== "all");
  const scopeLabel =
    scope === "standalone"
      ? "Standalone"
      : projects.find((project) => project.id === scope)?.name;
  const tagLabel = tags.find((tag) => tag.id === tagId)?.name;

  return (
    <>
      <Button
        type="button"
        variant={open || activeCount > 0 ? "secondary" : "outline"}
        className="shrink-0 gap-1.5 bg-white px-3"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Filter />
        <span>Filter</span>
        {activeCount > 0 && (
          <Badge className="size-5 rounded-full p-0">{activeCount}</Badge>
        )}
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {open && (
        <div className="col-span-2 space-y-3 rounded-lg border bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Filter notes</p>
            {activeCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  onScopeChange("all");
                  onTagChange("all");
                }}
              >
                <RotateCcw />
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600">Workspace / Project</Label>
            <Select value={scope} onValueChange={onScopeChange}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="All notes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All notes</SelectItem>
                <SelectItem value="standalone">Standalone notes</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600">Tag</Label>
            <Select value={tagId} onValueChange={onTagChange}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="All tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    #{tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeCount > 0 && (
            <div className="flex flex-wrap gap-2 border-t pt-3">
              {scopeLabel && <Badge variant="secondary">{scopeLabel}</Badge>}
              {tagLabel && <Badge variant="secondary">#{tagLabel}</Badge>}
            </div>
          )}
        </div>
      )}
    </>
  );
}
