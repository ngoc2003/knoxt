import { useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { Search } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { PROJECT_KNOWLEDGE_SEARCH } from "../../graphql/projectKnowledge";

type SearchItem = {
  id: string;
  type: string;
  title: string;
  snippet: string;
  status?: string | null;
};

export function ProjectMemorySearch({
  projectId,
  onOpenResult,
}: {
  projectId: string;
  onOpenResult: (item: SearchItem) => void;
}) {
  const [query, setQuery] = useState("");
  const [search, result] = useLazyQuery(PROJECT_KNOWLEDGE_SEARCH);
  const items =
    (
      result.data as
        | { projectKnowledgeSearch?: { items?: SearchItem[] } }
        | undefined
    )?.projectKnowledgeSearch?.items ?? [];

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 size-4 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="Search project memory..."
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            if (value.trim().length >= 2) {
              void search({
                variables: {
                  input: { projectId, query: value.trim() },
                  pagination: { take: 8 },
                },
              });
            }
          }}
        />
      </div>
      {query.trim().length >= 2 && items.length > 0 && (
        <div className="rounded-md border bg-white">
          {items.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              className="block w-full border-b px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
              type="button"
              onClick={() => onOpenResult(item)}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.title}</span>
                <Badge variant="outline">{item.type}</Badge>
                {item.status && <Badge variant="secondary">{item.status}</Badge>}
              </div>
              {item.snippet && (
                <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                  {item.snippet}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
