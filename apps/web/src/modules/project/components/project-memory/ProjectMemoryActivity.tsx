import { useQuery } from "@apollo/client/react";
import { PROJECT_ACTIVITY } from "../../graphql/projectKnowledge";

export function ProjectMemoryActivity({ projectId }: { projectId: string }) {
  const result = useQuery(PROJECT_ACTIVITY, {
    variables: { projectId, pagination: { take: 100 } },
  });
  const items =
    (
      result.data as
        | {
            projectActivity?: {
              items: {
                id: string;
                action: string;
                entity?: string;
                createdAt: string;
              }[];
            };
          }
        | undefined
    )?.projectActivity?.items ?? [];

  if (result.loading) {
    return (
      <p className="rounded-md border p-4 text-sm text-gray-500">Loading...</p>
    );
  }

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-gray-500">
          No project memory activity yet.
        </p>
      )}
      {items.map((item) => (
        <div
          key={item.id}
          className="flex justify-between rounded-md border p-3 text-sm"
        >
          <span>
            {item.action} · {item.entity}
          </span>
          <span className="text-gray-500">
            {new Date(item.createdAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
