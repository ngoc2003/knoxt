import { Injectable } from '@nestjs/common';
import { Prisma } from 'database/generated/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { PaginationInput } from '../../../core/common/dtos/pagination.dto';
import type {
  CreateNoteInput,
  ListNotesInput,
  UpdateNoteInput,
} from '../dto/note.dto';
import type { INoteRepository } from '../application/ports/note.repository';

@Injectable()
export class PrismaNoteRepository implements INoteRepository {
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
    return this.prisma.note.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  async update(userId: string, id: string, data: UpdateNoteInput) {
    return this.prisma.note.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    return this.prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
