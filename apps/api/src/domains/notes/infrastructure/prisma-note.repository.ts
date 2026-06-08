import { Injectable } from '@nestjs/common';
import { Prisma } from 'database/generated/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { PaginationInput } from '../../../core/common/dtos/pagination.dto';
import type {
  CreateNoteInput,
  ListNotesInput,
  MoveNoteInput,
  UpdateNoteInput,
} from '../dto/note.dto';
import type { INoteRepository } from '../application/ports/note.repository';

@Injectable()
export class PrismaNoteRepository implements INoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateNoteInput) {
    const { content = '', ...rest } = data;
    const lastSibling = await this.prisma.note.findFirst({
      where: {
        userId,
        parentId: data.parentId ?? null,
        deletedAt: null,
      },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const note = await this.prisma.note.create({
      data: {
        ...rest,
        content,
        userId,
        position: (lastSibling?.position ?? -1) + 1,
      },
    });
    if (note.parentId) {
      const inheritedShares = await this.prisma.noteShare.findMany({
        where: { noteId: note.parentId, includeChildren: true },
        select: {
          userId: true,
          sourceNoteId: true,
          permission: true,
          includeChildren: true,
        },
      });
      if (inheritedShares.length > 0) {
        await this.prisma.noteShare.createMany({
          data: inheritedShares.map((share) => ({
            noteId: note.id,
            ...share,
          })),
          skipDuplicates: true,
        });
      }
    }
    await this.audit(userId, 'note.created', note.id);
    return note;
  }

  async findAll(
    userId: string,
    filter: ListNotesInput,
    pagination: PaginationInput,
  ) {
    const where: Prisma.NoteWhereInput = {
      deletedAt: null,
      AND: [
        { OR: [{ userId }, { shares: { some: { userId } } }] },
        ...(filter.search
          ? [
              {
                OR: [
                  {
                    title: {
                      contains: filter.search,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    content: {
                      contains: filter.search,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                ],
              },
            ]
          : []),
      ],
      ...(filter.customerId && { customerId: filter.customerId }),
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

  async findTree(userId: string, search?: string) {
    const items = await this.prisma.note.findMany({
      where: {
        deletedAt: null,
        AND: [
          { OR: [{ userId }, { shares: { some: { userId } } }] },
          ...(search
            ? [
                {
                  OR: [
                    {
                      title: {
                        contains: search,
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                    {
                      content: {
                        contains: search,
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                  ],
                },
              ]
            : []),
        ],
      },
      select: {
        id: true,
        parentId: true,
        title: true,
        position: true,
        updatedAt: true,
        pins: {
          where: { userId },
          select: { noteId: true },
        },
        _count: {
          select: {
            children: {
              where: {
                deletedAt: null,
                OR: [{ userId }, { shares: { some: { userId } } }],
              },
            },
          },
        },
      },
      orderBy: [{ parentId: 'asc' }, { position: 'asc' }],
    });

    return items.map(({ _count, pins, ...note }) => ({
      ...note,
      isPinned: pins.length > 0,
      hasChildren: _count.children > 0,
    }));
  }

  async findOne(userId: string, id: string) {
    return this.prisma.note.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [{ userId }, { shares: { some: { userId } } }],
      },
    });
  }

  async findOwnedOne(userId: string, id: string) {
    return this.prisma.note.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  async customerExists(userId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, userId, deletedAt: null },
      select: { id: true },
    });
    return Boolean(customer);
  }

  async findSiblings(userId: string, parentId?: string | null) {
    return this.prisma.note.findMany({
      where: { userId, parentId: parentId ?? null, deletedAt: null },
      orderBy: { position: 'asc' },
    });
  }

  async isDescendant(userId: string, noteId: string, candidateId: string) {
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      WITH RECURSIVE descendants AS (
        SELECT "id"
        FROM "Note"
        WHERE "parentId" = ${noteId}
          AND "userId" = ${userId}
          AND "deletedAt" IS NULL

        UNION ALL

        SELECT child."id"
        FROM "Note" child
        INNER JOIN descendants parent ON child."parentId" = parent."id"
        WHERE child."userId" = ${userId}
          AND child."deletedAt" IS NULL
      )
      SELECT "id"
      FROM descendants
      WHERE "id" = ${candidateId}
      LIMIT 1
    `);
    return rows.length > 0;
  }

  async update(userId: string, id: string, data: UpdateNoteInput) {
    const { expectedVersion, ...changes } = data;
    const result = await this.prisma.note.updateMany({
      where: {
        id,
        deletedAt: null,
        version: expectedVersion,
        OR: [
          { userId },
          { shares: { some: { userId, permission: 'editor' } } },
        ],
      },
      data: { ...changes, version: { increment: 1 } },
    });
    if (result.count === 0) return null;
    const note = await this.prisma.note.findUniqueOrThrow({ where: { id } });
    await this.audit(userId, 'note.updated', id);
    return note;
  }

  async setPinned(userId: string, id: string, isPinned: boolean) {
    if (isPinned) {
      await this.prisma.notePin.upsert({
        where: { noteId_userId: { noteId: id, userId } },
        create: { noteId: id, userId },
        update: {},
      });
    } else {
      await this.prisma.notePin.deleteMany({ where: { noteId: id, userId } });
    }
    await this.audit(userId, isPinned ? 'note.pinned' : 'note.unpinned', id);
    return isPinned;
  }

  async move(userId: string, data: MoveNoteInput) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.note.findFirstOrThrow({
        where: { id: data.id, userId, deletedAt: null },
      });
      const oldInheritedSources = current.parentId
        ? await tx.noteShare.findMany({
            where: { noteId: current.parentId, includeChildren: true },
            select: { sourceNoteId: true },
          })
        : [];
      const destinationParentId = data.parentId ?? null;

      await tx.note.update({
        where: { id: data.id },
        data: { parentId: destinationParentId },
      });

      await Promise.all(
        data.orderedSiblingIds.map((id, position) =>
          tx.note.update({ where: { id }, data: { position } }),
        ),
      );

      if (current.parentId !== destinationParentId) {
        const oldSiblings = await tx.note.findMany({
          where: {
            userId,
            parentId: current.parentId,
            deletedAt: null,
            id: { not: data.id },
          },
          orderBy: { position: 'asc' },
          select: { id: true },
        });
        await Promise.all(
          oldSiblings.map(({ id }, position) =>
            tx.note.update({ where: { id }, data: { position } }),
          ),
        );

        const subtree = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
          WITH RECURSIVE subtree AS (
            SELECT "id" FROM "Note" WHERE "id" = ${data.id}
            UNION ALL
            SELECT child."id" FROM "Note" child
            INNER JOIN subtree parent ON child."parentId" = parent."id"
            WHERE child."userId" = ${userId} AND child."deletedAt" IS NULL
          )
          SELECT "id" FROM subtree
        `);
        const subtreeIds = subtree.map(({ id }) => id);
        const oldSourceIds = oldInheritedSources.map(
          ({ sourceNoteId }) => sourceNoteId,
        );
        if (oldSourceIds.length > 0) {
          await tx.noteShare.deleteMany({
            where: {
              noteId: { in: subtreeIds },
              sourceNoteId: { in: oldSourceIds },
            },
          });
        }

        if (destinationParentId) {
          const destinationShares = await tx.noteShare.findMany({
            where: { noteId: destinationParentId, includeChildren: true },
            select: {
              userId: true,
              sourceNoteId: true,
              permission: true,
              includeChildren: true,
            },
          });
          if (destinationShares.length > 0) {
            await tx.noteShare.createMany({
              data: subtreeIds.flatMap((noteId) =>
                destinationShares.map((share) => ({ noteId, ...share })),
              ),
              skipDuplicates: true,
            });
          }
        }
      }

      await tx.activityLog.create({
        data: {
          userId,
          action: 'note.moved',
          entity: 'note',
          entityId: data.id,
          meta: { parentId: destinationParentId },
        },
      });
      return tx.note.findUniqueOrThrow({ where: { id: data.id } });
    });
  }

  async remove(userId: string, id: string) {
    const deletedAt = new Date();
    await this.prisma.$executeRaw(Prisma.sql`
      WITH RECURSIVE subtree AS (
        SELECT "id"
        FROM "Note"
        WHERE "id" = ${id}
          AND "userId" = ${userId}
          AND "deletedAt" IS NULL

        UNION ALL

        SELECT child."id"
        FROM "Note" child
        INNER JOIN subtree parent ON child."parentId" = parent."id"
        WHERE child."userId" = ${userId}
          AND child."deletedAt" IS NULL
      )
      UPDATE "Note"
      SET "deletedAt" = ${deletedAt},
          "version" = "version" + 1,
          "updatedAt" = ${deletedAt}
      WHERE "id" IN (SELECT "id" FROM subtree)
    `);
    await this.audit(userId, 'note.deleted', id);
    return this.prisma.note.findUniqueOrThrow({ where: { id } });
  }

  private async audit(userId: string, action: string, entityId: string) {
    await this.prisma.activityLog.create({
      data: { userId, action, entity: 'note', entityId },
    });
  }
}
