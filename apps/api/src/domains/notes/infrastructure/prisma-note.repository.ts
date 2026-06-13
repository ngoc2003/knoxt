import { Injectable } from '@nestjs/common';
import { Prisma } from 'database/generated/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { PaginationInput } from '../../../core/common/dtos/pagination.dto';
import type {
  CreateNoteInput,
  AssignNoteProjectInput,
  ListNotesInput,
  MoveNoteInput,
  UpdateNoteInput,
} from '../dto/note.dto';
import type { INoteRepository } from '../application/ports/note.repository';

@Injectable()
export class PrismaNoteRepository implements INoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  private accessibleBy(userId: string): Prisma.NoteWhereInput {
    return {
      OR: [
        {
          projectId: null,
          OR: [{ userId }, { shares: { some: { userId } } }],
        },
        {
          project: {
            deletedAt: null,
            OR: [{ userId }, { members: { some: { userId } } }],
          },
        },
      ],
    };
  }

  async create(userId: string, data: CreateNoteInput) {
    const { content = '', ...rest } = data;
    const lastSibling = await this.prisma.note.findFirst({
      where: {
        projectId: data.projectId ?? null,
        ...(data.projectId ? {} : { userId }),
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
        this.accessibleBy(userId),
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
      ...(filter.projectId && { projectId: filter.projectId }),
      ...(filter.standaloneOnly && { projectId: null }),
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

  async findTree(
    userId: string,
    projectId?: string | null,
    standaloneOnly?: boolean,
    search?: string,
    tagIds?: string[],
  ) {
    const items = await this.prisma.note.findMany({
      where: {
        deletedAt: null,
        ...(projectId ? { projectId } : {}),
        ...(standaloneOnly ? { projectId: null } : {}),
        AND: [
          this.accessibleBy(userId),
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
          ...(tagIds?.length
            ? [{ tags: { some: { tagId: { in: tagIds } } } }]
            : []),
        ],
      },
      select: {
        id: true,
        projectId: true,
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
                ...(projectId ? { projectId } : {}),
                ...(standaloneOnly ? { projectId: null } : {}),
                ...this.accessibleBy(userId),
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
        ...this.accessibleBy(userId),
      },
    });
  }

  async findInScope(userId: string, projectId: string | null, id: string) {
    return this.prisma.note.findFirst({
      where: {
        id,
        projectId,
        deletedAt: null,
        ...(projectId ? {} : { userId }),
      },
    });
  }

  async findStandaloneEditable(userId: string, id: string) {
    return this.prisma.note.findFirst({
      where: {
        id,
        projectId: null,
        deletedAt: null,
        OR: [
          { userId },
          { shares: { some: { userId, permission: 'editor' } } },
        ],
      },
    });
  }

  async customerExists(userId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, userId, deletedAt: null },
      select: { id: true },
    });
    return Boolean(customer);
  }

  async findSiblings(
    userId: string,
    projectId: string | null,
    parentId?: string | null,
  ) {
    return this.prisma.note.findMany({
      where: {
        projectId,
        ...(projectId ? {} : { userId }),
        parentId: parentId ?? null,
        deletedAt: null,
      },
      orderBy: { position: 'asc' },
    });
  }

  async isDescendant(
    projectId: string | null,
    noteId: string,
    candidateId: string,
  ) {
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      WITH RECURSIVE descendants AS (
        SELECT "id"
        FROM "Note"
        WHERE "parentId" = ${noteId}
          AND "projectId" IS NOT DISTINCT FROM ${projectId}
          AND "deletedAt" IS NULL

        UNION ALL

        SELECT child."id"
        FROM "Note" child
        INNER JOIN descendants parent ON child."parentId" = parent."id"
        WHERE child."projectId" IS NOT DISTINCT FROM ${projectId}
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
      },
      data: { ...changes, version: { increment: 1 } },
    });
    if (result.count === 0) return null;
    const note = await this.prisma.note.findUniqueOrThrow({ where: { id } });
    await this.audit(userId, 'note.updated', id);
    return note;
  }

  async assignProject(userId: string, data: AssignNoteProjectInput) {
    const projectId = data.projectId ?? null;
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.note.findUniqueOrThrow({
        where: { id: data.noteId },
      });
      const subtree = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        WITH RECURSIVE subtree AS (
          SELECT "id"
          FROM "Note"
          WHERE "id" = ${data.noteId}
            AND "projectId" IS NOT DISTINCT FROM ${current.projectId}
            AND "deletedAt" IS NULL

          UNION ALL

          SELECT child."id"
          FROM "Note" child
          INNER JOIN subtree parent ON child."parentId" = parent."id"
          WHERE child."projectId" IS NOT DISTINCT FROM ${current.projectId}
            AND child."deletedAt" IS NULL
        )
        SELECT "id" FROM subtree
      `);
      const ids = subtree.map(({ id }) => id);
      const lastRoot = await tx.note.findFirst({
        where: {
          projectId,
          parentId: null,
          deletedAt: null,
          ...(projectId ? {} : { userId }),
          id: { notIn: ids },
        },
        orderBy: { position: 'desc' },
        select: { position: true },
      });

      await tx.note.updateMany({
        where: { id: { in: ids } },
        data: {
          projectId,
          ...(projectId ? {} : { userId }),
          version: { increment: 1 },
        },
      });
      await tx.note.update({
        where: { id: data.noteId },
        data: { parentId: null, position: (lastRoot?.position ?? -1) + 1 },
      });
      await tx.noteShare.deleteMany({ where: { noteId: { in: ids } } });
      await tx.activityLog.create({
        data: {
          userId,
          action: 'note.project-assigned',
          entity: 'note',
          entityId: data.noteId,
          meta: { projectId, subtreeSize: ids.length },
        },
      });
      return tx.note.findUniqueOrThrow({ where: { id: data.noteId } });
    });
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

  async move(userId: string, projectId: string | null, data: MoveNoteInput) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.note.findFirstOrThrow({
        where: { id: data.id, projectId, deletedAt: null },
      });
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
            projectId,
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

  async remove(userId: string, projectId: string | null, id: string) {
    const deletedAt = new Date();
    await this.prisma.$executeRaw(Prisma.sql`
      WITH RECURSIVE subtree AS (
        SELECT "id"
        FROM "Note"
        WHERE "id" = ${id}
          AND "projectId" IS NOT DISTINCT FROM ${projectId}
          AND "deletedAt" IS NULL

        UNION ALL

        SELECT child."id"
        FROM "Note" child
        INNER JOIN subtree parent ON child."parentId" = parent."id"
        WHERE child."projectId" IS NOT DISTINCT FROM ${projectId}
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
