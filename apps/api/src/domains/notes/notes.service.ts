import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NOTE_REPOSITORY } from '../../core/constants/repository.tokens';
import type { INoteRepository } from './application/ports/note.repository';
import { CreateNoteInput, ListNotesInput, UpdateNoteInput } from './dto/note.dto';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';

@Injectable()
export class NotesService {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepo: INoteRepository,
  ) {}

  async create(userId: string, data: CreateNoteInput) {
    return this.noteRepo.create(userId, data);
  }

  async findAll(userId: string, filter: ListNotesInput, pagination: PaginationInput) {
    return this.noteRepo.findAll(userId, filter, pagination);
  }

  async findOne(userId: string, id: string) {
    const note = await this.noteRepo.findOne(userId, id);
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async update(userId: string, id: string, data: UpdateNoteInput) {
    await this.findOne(userId, id);
    return this.noteRepo.update(userId, id, data);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.noteRepo.remove(userId, id);
  }
}
