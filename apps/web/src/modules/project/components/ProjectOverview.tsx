import { useQuery } from "@apollo/client/react";
import { FileText, Link as LinkIcon, Pin } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { PROJECT_OVERVIEW_QUERY } from "../graphql/project";

type OverviewNote = { id: string; title: string; updatedAt: string };
type OverviewAttachment = {
  id: string;
  noteId: string;
  noteTitle: string;
  filename: string;
  url: string;
};

export function ProjectOverview({
  projectId,
  onOpenDocument,
}: {
  projectId: string;
  onOpenDocument: (noteId: string) => void;
}) {
  const { data, loading } = useQuery(PROJECT_OVERVIEW_QUERY, {
    variables: { projectId },
  });
  const overview = (
    data as {
      projectOverview?: {
        recentNotes: OverviewNote[];
        pinnedNotes: OverviewNote[];
        recentAttachments: OverviewAttachment[];
      };
    }
  )?.projectOverview;
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-3">
      <OverviewCard
        title="Recent documents"
        icon={<FileText className="size-4" />}
      >
        {loading && <OverviewSkeleton />}
        {overview?.recentNotes.map((note) => (
          <button
            key={note.id}
            className="block w-full truncate rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50"
            onClick={() => onOpenDocument(note.id)}
          >
            {note.title}
          </button>
        ))}
      </OverviewCard>
      <OverviewCard title="Pinned documents" icon={<Pin className="size-4" />}>
        {loading && <OverviewSkeleton />}
        {overview?.pinnedNotes.map((note) => (
          <button
            key={note.id}
            className="block w-full truncate rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50"
            onClick={() => onOpenDocument(note.id)}
          >
            {note.title}
          </button>
        ))}
      </OverviewCard>
      <OverviewCard
        title="Recent attachments"
        icon={<LinkIcon className="size-4" />}
      >
        {loading && <OverviewSkeleton />}
        {overview?.recentAttachments.map((attachment) => (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="block truncate rounded px-2 py-1.5 text-sm hover:bg-gray-50"
          >
            {attachment.filename}
            <span className="ml-2 text-xs text-gray-400">
              {attachment.noteTitle}
            </span>
          </a>
        ))}
      </OverviewCard>
    </div>
  );
}

function OverviewCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="min-h-52 p-4">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h2>
      <div className="space-y-1 text-gray-600">{children}</div>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-3 px-2 py-1">
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-5 w-3/5" />
      <Skeleton className="h-5 w-2/3" />
    </div>
  );
}
