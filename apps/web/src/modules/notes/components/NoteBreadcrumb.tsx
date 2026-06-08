import { Link } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import type { NoteTreeItem } from "../types/note";

export function NoteBreadcrumb({
  noteId,
  notes,
}: {
  noteId: string;
  notes: NoteTreeItem[];
}) {
  const byId = new Map(notes.map((note) => [note.id, note]));
  const path: NoteTreeItem[] = [];
  let current = byId.get(noteId);

  while (current) {
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {path.map((note, index) => (
          <span key={note.id} className="contents">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === path.length - 1 ? (
                <BreadcrumbPage className="max-w-56 truncate">
                  {note.title}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link className="max-w-40 truncate" to={`/notes/${note.id}`}>
                    {note.title}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
