import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type { NoteTag } from "../types/note";

export function NoteTagSelector({
  tags,
  suggestions,
  onChange,
}: {
  tags: string[];
  suggestions: NoteTag[];
  onChange: (tags: string[]) => void;
}) {
  const [value, setValue] = useState("");
  const add = (name: string) => {
    const clean = name.trim();
    if (clean && !tags.some((tag) => tag.toLowerCase() === clean.toLowerCase())) {
      onChange([...tags, clean]);
    }
    setValue("");
  };
  const available = suggestions.filter(
    (suggestion) =>
      !tags.includes(suggestion.name) &&
      (!value || suggestion.name.toLowerCase().includes(value.toLowerCase())),
  );

  return (
    <div className="space-y-3">
      <div className="flex min-h-9 flex-wrap gap-2 rounded-md border p-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(tags.filter((item) => item !== tag))}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={value}
          className="h-6 min-w-28 flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
          placeholder={tags.length ? "Add tag..." : "Add or create a tag..."}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              add(value);
            }
          }}
        />
      </div>
      {(available.length > 0 || value.trim()) && (
        <div className="flex flex-wrap gap-2">
          {available.slice(0, 8).map((tag) => (
            <Button
              key={tag.id}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => add(tag.name)}
            >
              <Plus />
              {tag.name}
            </Button>
          ))}
          {value.trim() && (
            <Button type="button" size="sm" variant="outline" onClick={() => add(value)}>
              <Plus />
              Create "{value.trim()}"
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
