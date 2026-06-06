import type { Note } from 'database/generated/client';
import type {
  PaginationInput,
  PageResult,
} from '../../../../core/common/dtos/pagination.dto';
import type {
  CreateNoteInput,
  ListNotesInput,
  UpdateNoteInput,
} from '../../dto/note.dto';

export interface INoteRepository {
  create(userId: string, data: CreateNoteInput): Promise<Note>;
  findAll(
    userId: string,
    filter: ListNotesInput,
    pagination: PaginationInput,
  ): Promise<PageResult<Note>>;
  findOne(userId: string, id: string): Promise<Note | null>;
  update(userId: string, id: string, data: UpdateNoteInput): Promise<Note>;
  remove(userId: string, id: string): Promise<Note>;
}
