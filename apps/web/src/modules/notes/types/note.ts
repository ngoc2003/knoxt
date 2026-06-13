export interface NoteTreeItem {
  id: string;
  projectId?: string | null;
  parentId?: string | null;
  title: string;
  position: number;
  isPinned: boolean;
  hasChildren: boolean;
  updatedAt: string;
}

export interface NoteDetail {
  id: string;
  projectId?: string | null;
  title: string;
  content: string;
  customerId?: string | null;
  parentId?: string | null;
  position: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface NoteTreeNode extends NoteTreeItem {
  children: NoteTreeNode[];
}

export type EditorMode = "rich" | "edit" | "preview" | "split";

export interface NoteTag {
  id: string;
  name: string;
  color?: string | null;
}

export interface NoteAttachment {
  id: string;
  url: string;
  filename: string;
  mimeType?: string | null;
  size?: number | null;
}

export interface NoteShare {
  id: string;
  noteId: string;
  userId: string;
  permission: "viewer" | "editor";
  includeChildren: boolean;
  user: { id: string; name: string; email: string };
}

export interface NoteWorkspaceMeta {
  tags: NoteTag[];
  attachments: NoteAttachment[];
  shares: NoteShare[];
  publicLink?: {
    id: string;
    includeChildren: boolean;
    expiresAt?: string | null;
    revokedAt?: string | null;
  } | null;
}

export interface NoteSearchResult {
  id: string;
  projectId?: string | null;
  projectName?: string | null;
  title: string;
  snippet: string;
  tags: NoteTag[];
  score: number;
  updatedAt: string;
}
