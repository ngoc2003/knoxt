import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { NOTE_REPOSITORY } from '../../core/constants/repository.tokens';
import type { INoteRepository } from './application/ports/note.repository';
import {
  CreateNoteInput,
  ListNotesInput,
  MoveNoteInput,
  UpdateNoteInput,
} from './dto/note.dto';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';

@Injectable()
export class NotesService {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepo: INoteRepository,
  ) {}

  async create(userId: string, data: CreateNoteInput) {
    await this.ensureParent(userId, data.parentId);
    await this.ensureCustomer(userId, data.customerId);
    return this.noteRepo.create(userId, data);
  }

  async findAll(
    userId: string,
    filter: ListNotesInput,
    pagination: PaginationInput,
  ) {
    return this.noteRepo.findAll(userId, filter, pagination);
  }

  async findTree(userId: string, search?: string) {
    return this.noteRepo.findTree(userId, search);
  }

  async findOne(userId: string, id: string) {
    const note = await this.noteRepo.findOne(userId, id);
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async update(userId: string, id: string, data: UpdateNoteInput) {
    await this.findOne(userId, id);
    await this.ensureCustomer(userId, data.customerId);
    const note = await this.noteRepo.update(userId, id, data);
    if (!note) {
      throw new ConflictException(
        'Note changed since it was loaded. Refresh before saving again.',
      );
    }
    return note;
  }

  async setPinned(userId: string, id: string, isPinned: boolean) {
    await this.findOne(userId, id);
    return this.noteRepo.setPinned(userId, id, isPinned);
  }

  async move(userId: string, data: MoveNoteInput) {
    await this.findOwnedOne(userId, data.id);
    await this.ensureParent(userId, data.parentId);

    if (data.parentId === data.id) {
      throw new BadRequestException('A note cannot be its own parent');
    }
    if (
      data.parentId &&
      (await this.noteRepo.isDescendant(userId, data.id, data.parentId))
    ) {
      throw new BadRequestException('A note cannot move into its descendant');
    }

    const siblingIds = (await this.noteRepo.findSiblings(userId, data.parentId))
      .map((note) => note.id)
      .filter((id) => id !== data.id);
    const expectedIds = [...siblingIds, data.id].sort();
    const orderedIds = [...new Set(data.orderedSiblingIds)].sort();
    if (
      orderedIds.length !== data.orderedSiblingIds.length ||
      orderedIds.length !== expectedIds.length ||
      orderedIds.some((id, index) => id !== expectedIds[index])
    ) {
      throw new BadRequestException(
        'orderedSiblingIds must contain every destination sibling exactly once',
      );
    }

    return this.noteRepo.move(userId, data);
  }

  async remove(userId: string, id: string) {
    await this.findOwnedOne(userId, id);
    return this.noteRepo.remove(userId, id);
  }

  private async ensureParent(userId: string, parentId?: string | null) {
    if (!parentId) return;
    const parent = await this.noteRepo.findOwnedOne(userId, parentId);
    if (!parent) throw new BadRequestException('Parent note not found');
  }

  private async ensureCustomer(userId: string, customerId?: string | null) {
    if (!customerId) return;
    if (!(await this.noteRepo.customerExists(userId, customerId))) {
      throw new BadRequestException('Customer not found');
    }
  }

  private async findOwnedOne(userId: string, id: string) {
    const note = await this.noteRepo.findOwnedOne(userId, id);
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }
}
