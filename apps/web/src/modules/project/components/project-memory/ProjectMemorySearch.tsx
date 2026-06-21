import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { FileSearch } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { PROJECT_KNOWLEDGE_SEARCH } from "../../graphql/projectKnowledge";

type SearchItem = {
  id: string;
  type: string;
  title: string;
  snippet: string;
  status?: string;
  updatedAt?: string;
};

const typeLabels: Record<string, string> = {
  note: "Notes",
  action: "Actions",
  decision: "Decisions",
  meeting: "Meetings",
  requirement: "Requirements",
};

export function ProjectMemorySearch({
  projectId,
  onOpenResult,
}: {
  projectId: string;
  onOpenResult?: (item: SearchItem) => void;
}) {
  const [query, setQuery] = useState("");
  const result = useQuery(PROJECT_KNOWLEDGE_SEARCH, {
    variables: { input: { projectId, query }, pagination: { take: 50 } },
    skip: query.trim().length < 2,
  });
  const items =
    (
      result.data as
        | {
            projectKnowledgeSearch?: {
              items: SearchItem[];
            };
          }
        | undefined
    )?.projectKnowledgeSearch?.items ?? [];
  const grouped = useMemo(
    () =>
      items.reduce<Record<string, SearchItem[]>>((acc, item) => {
        acc[item.type] = [...(acc[item.type] ?? []), item];
        return acc;
      }, {}),
    [items],
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <FileSearch className="absolute left-3 top-2.5 size-4 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="Search project memory..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {query.trim().length < 2 && (
        <p className="rounded-md border border-dashed p-4 text-center text-sm text-gray-500">
          Enter at least 2 characters to search this project.
        </p>
      )}
      {result.loading && (
        <p className="rounded-md border p-4 text-sm text-gray-500">
          Searching...
        </p>
      )}
      {result.error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {result.error.message}
        </p>
      )}
      {!result.loading &&
        query.trim().length >= 2 &&
        !result.error &&
        items.length === 0 && (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-gray-500">
            No project memory matches this search.
          </p>
        )}
      {Object.entries(grouped).map(([type, rows]) => (
        <div key={type} className="space-y-2">
          <h3 className="text-xs font-semibold uppercase text-gray-500">
            {typeLabels[type] ?? type}
          </h3>
          {rows.map((item) => (
            <button
              type="button"
              key={`${item.type}-${item.id}`}
              className="block w-full rounded-md border p-3 text-left transition hover:border-gray-300 hover:bg-gray-50"
              onClick={() => onOpenResult?.(item)}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{item.type}</Badge>
                <strong className="min-w-0">{item.title}</strong>
                {item.status && <Badge variant="outline">{item.status}</Badge>}
              </div>
              <p className="mt-1 text-sm text-gray-500">{item.snippet}</p>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
