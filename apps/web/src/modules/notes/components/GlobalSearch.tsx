import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { FileText, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/shared/ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { SEARCH_NOTES_QUERY } from "../graphql/note";
import type { NoteSearchResult } from "../types/note";

export function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  const result = useQuery(SEARCH_NOTES_QUERY, {
    variables: { input: { query: debounced || undefined }, pagination: { take: 12 } },
    skip: !open,
    fetchPolicy: "cache-and-network",
  });
  const items =
    (result.data as { searchNotes?: { items: NoteSearchResult[] } })?.searchNotes
      ?.items ?? [];

  return (
    <>
      <button
        type="button"
        className="flex h-9 w-full items-center gap-2 rounded-md border bg-gray-50 px-3 text-sm text-gray-500"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search notes...</span>
        <kbd className="rounded border bg-white px-1.5 text-xs">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search notes">
        <CommandInput value={query} onValueChange={setQuery} placeholder="Search title, content or tags..." />
        <CommandList>
          <CommandEmpty>No matching notes.</CommandEmpty>
          <CommandGroup heading={`${items.length} results`}>
            {items.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.title} ${item.snippet} ${item.tags.map((tag) => tag.name).join(" ")}`}
                onSelect={() => {
                  setOpen(false);
                  navigate(`/notes/${item.id}${item.projectId ? `?projectId=${item.projectId}` : ""}`);
                }}
              >
                <FileText />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{item.title}</span>
                    {item.projectName && <Badge variant="outline">{item.projectName}</Badge>}
                  </div>
                  <p className="truncate text-xs text-gray-500">{item.snippet || "No content"}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
