import type { Note } from 'database/generated/client';
import type {
  PaginationInput,
  PageResult,
} from '../../../../core/common/dtos/pagination.dto';
import type {
  CreateNoteInput,
  AssignNoteProjectInput,
  ListNotesInput,
  MoveNoteInput,
  UpdateNoteInput,
} from '../../dto/note.dto';

export type NoteTreeRecord = Pick<
  Note,
  'id' | 'projectId' | 'parentId' | 'title' | 'position' | 'updatedAt'
> & {
  isPinned: boolean;
  hasChildren: boolean;
};

export interface INoteRepository {
  create(userId: string, data: CreateNoteInput): Promise<Note>;
  findAll(
    userId: string,
    filter: ListNotesInput,
    pagination: PaginationInput,
  ): Promise<PageResult<Note>>;
  findTree(
    userId: string,
    projectId?: string | null,
    standaloneOnly?: boolean,
    search?: string,
    tagIds?: string[],
  ): Promise<NoteTreeRecord[]>;
  findOne(userId: string, id: string): Promise<Note | null>;
  findInScope(
    userId: string,
    projectId: string | null,
    id: string,
  ): Promise<Note | null>;
  findStandaloneEditable(userId: string, id: string): Promise<Note | null>;
  customerExists(userId: string, id: string): Promise<boolean>;
  findSiblings(
    userId: string,
    projectId: string | null,
    parentId?: string | null,
  ): Promise<Note[]>;
  isDescendant(
    projectId: string | null,
    noteId: string,
    candidateId: string,
  ): Promise<boolean>;
  update(
    userId: string,
    id: string,
    data: UpdateNoteInput,
  ): Promise<Note | null>;
  assignProject(userId: string, data: AssignNoteProjectInput): Promise<Note>;
  setPinned(userId: string, id: string, isPinned: boolean): Promise<boolean>;
  move(
    userId: string,
    projectId: string | null,
    data: MoveNoteInput,
  ): Promise<Note>;
  remove(userId: string, projectId: string | null, id: string): Promise<Note>;
}
