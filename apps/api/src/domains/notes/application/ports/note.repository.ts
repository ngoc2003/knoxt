import type { Note } from 'database/generated/client';
import type {
  PaginationInput,
  PageResult,
} from '../../../../core/common/dtos/pagination.dto';
import type {
  CreateNoteInput,
  ListNotesInput,
  MoveNoteInput,
  UpdateNoteInput,
} from '../../dto/note.dto';

export type NoteTreeRecord = Pick<
  Note,
  'id' | 'parentId' | 'title' | 'position' | 'updatedAt'
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
  findTree(userId: string, search?: string): Promise<NoteTreeRecord[]>;
  findOne(userId: string, id: string): Promise<Note | null>;
  findOwnedOne(userId: string, id: string): Promise<Note | null>;
  customerExists(userId: string, id: string): Promise<boolean>;
  findSiblings(userId: string, parentId?: string | null): Promise<Note[]>;
  isDescendant(
    userId: string,
    noteId: string,
    candidateId: string,
  ): Promise<boolean>;
  update(
    userId: string,
    id: string,
    data: UpdateNoteInput,
  ): Promise<Note | null>;
  setPinned(userId: string, id: string, isPinned: boolean): Promise<boolean>;
  move(userId: string, data: MoveNoteInput): Promise<Note>;
  remove(userId: string, id: string): Promise<Note>;
}
