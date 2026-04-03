import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateNoteInput,
  ListNotesInput,
  UpdateNoteInput,
} from './dto/note.dto';
import { PaginationInput } from '../../common/pagination.dto';
import { Prisma } from 'database/generated/client';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateNoteInput) {
    return this.prisma.note.create({
      data: { ...data, userId },
    });
  }

  async findAll(
    userId: string,
    filter: ListNotesInput,
    pagination: PaginationInput,
  ) {
    const where: Prisma.NoteWhereInput = {
      userId,
      deletedAt: null,
      ...(filter.customerId && { customerId: filter.customerId }),
      ...(filter.search && {
        OR: [
          { title: { contains: filter.search, mode: 'insensitive' } },
          { content: { contains: filter.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        skip: pagination.skip ?? 0,
        take: pagination.take ?? 20,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.note.count({ where }),
    ]);

    return {
      items,
      total,
      skip: pagination.skip ?? 0,
      take: pagination.take ?? 20,
    };
  }

  async findOne(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async update(userId: string, id: string, data: UpdateNoteInput) {
    await this.findOne(userId, id);
    return this.prisma.note.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
