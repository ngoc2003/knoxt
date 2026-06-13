import { Injectable } from '@nestjs/common';
import { Prisma } from 'database/generated/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';
import { SearchNotesInput } from './dto/note-search.dto';

@Injectable()
export class NoteSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(userId: string, input: SearchNotesInput, page: PaginationInput) {
    const query = input.query?.trim() ?? '';
    const where: Prisma.NoteWhereInput = {
      deletedAt: null,
      ...(input.projectId ? { projectId: input.projectId } : {}),
      ...(input.standaloneOnly ? { projectId: null } : {}),
      ...(input.tagIds?.length
        ? { tags: { some: { tagId: { in: input.tagIds } } } }
        : {}),
      OR: [
        { projectId: null, OR: [{ userId }, { shares: { some: { userId } } }] },
        {
          project: {
            deletedAt: null,
            OR: [{ userId }, { members: { some: { userId } } }],
          },
        },
      ],
      ...(query
        ? {
            AND: [
              {
                OR: [
                  { title: { contains: query, mode: 'insensitive' } },
                  { content: { contains: query, mode: 'insensitive' } },
                  {
                    tags: {
                      some: {
                        tag: { name: { contains: query, mode: 'insensitive' } },
                      },
                    },
                  },
                ],
              },
            ],
          }
        : {}),
    };
    const skip = page.skip ?? 0;
    const take = page.take ?? 20;
    const [notes, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          project: { select: { name: true } },
          tags: { include: { tag: true } },
        },
      }),
      this.prisma.note.count({ where }),
    ]);
    const needle = query.toLowerCase();
    const items = notes.map((note) => {
      const tags = note.tags.map(({ tag }) => tag);
      const score = query
        ? (note.title.toLowerCase().includes(needle) ? 3 : 0) +
          (tags.some((tag) => tag.name.toLowerCase().includes(needle))
            ? 2
            : 0) +
          (note.content.toLowerCase().includes(needle) ? 1 : 0)
        : 0;
      return {
        id: note.id,
        projectId: note.projectId,
        projectName: note.project?.name ?? null,
        title: note.title,
        snippet: this.snippet(note.content, query),
        tags,
        score,
        updatedAt: note.updatedAt,
      };
    });
    items.sort(
      (a, b) =>
        b.score - a.score || b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
    return { items, total, skip, take };
  }

  private snippet(content: string, query: string) {
    const plain = content
      .replace(/[#>*_`[\]()~-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!plain) return '';
    const found = query ? plain.toLowerCase().indexOf(query.toLowerCase()) : 0;
    const start = Math.max(0, found - 60);
    const value = plain.slice(start, start + 180);
    return `${start > 0 ? '...' : ''}${value}${start + 180 < plain.length ? '...' : ''}`;
  }
}
