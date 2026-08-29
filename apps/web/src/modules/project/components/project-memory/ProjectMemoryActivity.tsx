import { useQuery } from "@apollo/client/react";
import { Badge } from "@/shared/ui/badge";
import { PROJECT_ACTIVITY } from "../../graphql/projectKnowledge";

type ActivityItem = {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  createdAt: string;
};

export function ProjectMemoryActivity({ projectId }: { projectId: string }) {
  const query = useQuery(PROJECT_ACTIVITY, {
    variables: { projectId, pagination: { take: 30 } },
    fetchPolicy: "cache-and-network",
  });
  const items =
    (
      query.data as
        | { projectActivity?: { items?: ActivityItem[] } }
        | undefined
    )?.projectActivity?.items ?? [];

  if (query.loading && items.length === 0) {
    return <p className="rounded-md border p-6 text-sm text-gray-500">Loading...</p>;
  }

  if (query.error) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {query.error.message}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-gray-500">
          No activity yet.
        </p>
      )}
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{item.entity}</Badge>
            <span className="text-sm font-medium">{item.action}</span>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(item.createdAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
