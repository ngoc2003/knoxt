import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { Prisma, NotePermission } from 'database/generated/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ProjectAuthorizationService } from '../../core/authorization/project-authorization.service';
import { Permission } from '../../core/common/enum/enums';
import {
  AddNoteAttachmentInput,
  CreateNotePublicLinkInput,
  SetNoteTagsInput,
  ShareNoteInput,
} from './dto/note-sharing.dto';

@Injectable()
export class NoteSharingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectAuthorization: ProjectAuthorizationService,
  ) {}

  tags(userId: string) {
    return this.prisma.noteTag.findMany({
      where: {
        OR: [
          { userId },
          {
            notes: {
              some: {
                note: {
                  deletedAt: null,
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
                },
              },
            },
          },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }

  async createPublicLink(userId: string, data: CreateNotePublicLinkInput) {
    await this.assertOwner(userId, data.noteId);
    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hashToken(token);
    const link = await this.prisma.notePublicLink.upsert({
      where: { noteId: data.noteId },
      create: {
        noteId: data.noteId,
        tokenHash,
        includeChildren: data.includeChildren ?? false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
      update: {
        tokenHash,
        includeChildren: data.includeChildren ?? false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        revokedAt: null,
      },
    });
    await this.audit(userId, 'note.public-link-created', data.noteId);
    return { token, link };
  }

  async revokePublicLink(userId: string, noteId: string) {
    await this.assertOwner(userId, noteId);
    const link = await this.prisma.notePublicLink.findUnique({
      where: { noteId },
    });
    if (!link) throw new NotFoundException('Public link not found');
    await this.prisma.notePublicLink.update({
      where: { noteId },
      data: { revokedAt: new Date() },
    });
    await this.audit(userId, 'note.public-link-revoked', noteId);
    return true;
  }

  async publicNote(token: string) {
    const link = await this.prisma.notePublicLink.findFirst({
      where: {
        tokenHash: this.hashToken(token),
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        note: {
          deletedAt: null,
          OR: [{ projectId: null }, { project: { deletedAt: null } }],
        },
      },
      include: { note: true },
    });
    if (!link) throw new NotFoundException('Shared note not found');

    const children = link.includeChildren
      ? await this.descendants(link.noteId, link.note.projectId)
      : [];
    return { note: this.toPublicNote(link.note), children };
  }

  async shareWithUser(userId: string, data: ShareNoteInput) {
    const note = await this.assertStandaloneOwner(userId, data.noteId);
    const target = await this.prisma.user.findFirst({
      where: { email: { equals: data.email, mode: 'insensitive' } },
    });
    if (!target) throw new NotFoundException('User not found');
    if (target.id === note.userId) {
      throw new BadRequestException('Note owner already has access');
    }
    const descendantIds = data.includeChildren
      ? (await this.descendantIds(data.noteId, note.projectId)).map(
          ({ id }) => id,
        )
      : [];
    const sharedNoteIds = [data.noteId, ...descendantIds];

    const share = await this.prisma.$transaction(async (tx) => {
      await tx.noteShare.deleteMany({
        where: { sourceNoteId: data.noteId, userId: target.id },
      });
      await tx.noteShare.createMany({
        data: sharedNoteIds.map((noteId) => ({
          noteId,
          userId: target.id,
          sourceNoteId: data.noteId,
          permission: data.permission as NotePermission,
          includeChildren: data.includeChildren ?? false,
        })),
      });
      return tx.noteShare.findFirstOrThrow({
        where: {
          noteId: data.noteId,
          userId: target.id,
          sourceNoteId: data.noteId,
        },
        include: { user: true },
      });
    });
    await this.audit(userId, 'note.user-shared', data.noteId, {
      sharedWith: target.id,
      permission: data.permission,
      includeChildren: data.includeChildren ?? false,
    });
    return share;
  }

  async removeShare(userId: string, noteId: string, sharedUserId: string) {
    await this.assertStandaloneOwner(userId, noteId);
    const deleted = await this.prisma.noteShare.deleteMany({
      where: { sourceNoteId: noteId, userId: sharedUserId },
    });
    if (deleted.count === 0)
      throw new NotFoundException('Note share not found');
    await this.audit(userId, 'note.user-share-removed', noteId, {
      sharedUserId,
    });
    return true;
  }

  async meta(userId: string, noteId: string) {
    await this.assertReadable(userId, noteId);
    const note = await this.prisma.note.findUniqueOrThrow({
      where: { id: noteId },
      include: {
        tags: { include: { tag: true } },
        attachments: true,
        shares: {
          where: { sourceNoteId: noteId, noteId },
          include: { user: true },
        },
        publicLink: true,
      },
    });
    return {
      tags: note.tags.map(({ tag }) => tag),
      attachments: note.attachments,
      shares: note.shares,
      publicLink: note.publicLink,
    };
  }

  async setTags(userId: string, data: SetNoteTagsInput) {
    await this.assertEditable(userId, data.noteId);
    const names = [
      ...new Set(data.tags.map((tag) => tag.trim()).filter(Boolean)),
    ];
    const tags = await Promise.all(
      names.map((name) =>
        this.prisma.noteTag.upsert({
          where: { userId_name: { userId, name } },
          create: { userId, name },
          update: {},
        }),
      ),
    );
    await this.prisma.note.update({
      where: { id: data.noteId },
      data: {
        tags: {
          deleteMany: {},
          create: tags.map((tag) => ({ tagId: tag.id })),
        },
      },
    });
    await this.audit(userId, 'note.tags-updated', data.noteId, { tags: names });
    return tags;
  }

  async addAttachment(userId: string, data: AddNoteAttachmentInput) {
    await this.assertEditable(userId, data.noteId);
    const attachment = await this.prisma.attachment.create({ data });
    await this.audit(userId, 'note.attachment-added', data.noteId, {
      attachmentId: attachment.id,
    });
    return attachment;
  }

  async removeAttachment(userId: string, id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });
    if (!attachment) throw new NotFoundException('Attachment not found');
    await this.assertEditable(userId, attachment.noteId);
    const deleted = await this.prisma.attachment.delete({ where: { id } });
    await this.audit(userId, 'note.attachment-removed', attachment.noteId, {
      attachmentId: id,
    });
    return deleted;
  }

  async trash(userId: string, projectId?: string, standaloneOnly?: boolean) {
    if (projectId) {
      await this.projectAuthorization.assertPermission(
        userId,
        projectId,
        Permission.projectRead,
      );
    }
    return this.prisma.note.findMany({
      where: {
        deletedAt: { not: null },
        ...(projectId ? { projectId } : {}),
        ...(standaloneOnly ? { projectId: null } : {}),
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
      },
      orderBy: { deletedAt: 'desc' },
    });
  }

  async restore(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, deletedAt: { not: null } },
    });
    if (!note) throw new NotFoundException('Deleted note not found');
    await this.assertEditableRecord(userId, note);

    const deletedParent = note.parentId
      ? await this.prisma.note.findFirst({
          where: {
            id: note.parentId,
            projectId: note.projectId,
            deletedAt: { not: null },
          },
          select: { id: true },
        })
      : null;

    if (deletedParent) {
      return this.restoreChildAsNewTree(userId, note);
    }

    await this.prisma.$executeRaw(Prisma.sql`
      WITH RECURSIVE subtree AS (
        SELECT "id" FROM "Note"
      WHERE "id" = ${id} AND "projectId" IS NOT DISTINCT FROM ${note.projectId} AND "deletedAt" = ${note.deletedAt}
        UNION ALL
        SELECT child."id" FROM "Note" child
        INNER JOIN subtree parent ON child."parentId" = parent."id"
        WHERE child."projectId" IS NOT DISTINCT FROM ${note.projectId} AND child."deletedAt" = ${note.deletedAt}
      )
      UPDATE "Note" SET "deletedAt" = NULL, "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" IN (SELECT "id" FROM subtree)
    `);
    await this.audit(userId, 'note.restored', id);
    return this.prisma.note.findUniqueOrThrow({ where: { id } });
  }

  private async restoreChildAsNewTree(
    userId: string,
    root: { id: string; projectId: string | null; deletedAt: Date | null },
  ) {
    const deletedAt = root.deletedAt;
    if (!deletedAt) throw new NotFoundException('Deleted note not found');

    const subtree = await this.prisma.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`
        WITH RECURSIVE subtree AS (
          SELECT "id" FROM "Note"
          WHERE "id" = ${root.id}
            AND "projectId" IS NOT DISTINCT FROM ${root.projectId}
            AND "deletedAt" = ${deletedAt}
          UNION ALL
          SELECT child."id" FROM "Note" child
          INNER JOIN subtree parent ON child."parentId" = parent."id"
          WHERE child."projectId" IS NOT DISTINCT FROM ${root.projectId}
            AND child."deletedAt" = ${deletedAt}
        )
        SELECT "id" FROM subtree
      `,
    );
    const subtreeIds = subtree.map(({ id }) => id);
    const notes = await this.prisma.note.findMany({
      where: { id: { in: subtreeIds } },
      include: {
        tags: true,
        attachments: true,
        pins: { where: { userId } },
      },
    });
    const byId = new Map(notes.map((note) => [note.id, note]));
    const ordered = this.orderSubtree(root.id, byId);

    return this.prisma.$transaction(async (tx) => {
      const lastRoot = await tx.note.findFirst({
        where: {
          projectId: root.projectId,
          ...(root.projectId ? {} : { userId }),
          parentId: null,
          deletedAt: null,
        },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      const clonedIds = new Map<string, string>();
      let restoredRootId = '';

      for (const original of ordered) {
        const isRoot = original.id === root.id;
        const cloned = await tx.note.create({
          data: {
            userId,
            projectId: original.projectId,
            customerId: original.customerId,
            parentId: isRoot
              ? null
              : (clonedIds.get(original.parentId ?? '') ?? null),
            title: original.title,
            content: original.content,
            position: isRoot
              ? (lastRoot?.position ?? -1) + 1
              : original.position,
            tags: {
              create: original.tags.map(({ tagId }) => ({ tagId })),
            },
            attachments: {
              create: original.attachments.map(
                ({ url, filename, mimeType, size }) => ({
                  url,
                  filename,
                  mimeType,
                  size,
                }),
              ),
            },
            pins: original.pins.length > 0 ? { create: { userId } } : undefined,
          },
        });
        clonedIds.set(original.id, cloned.id);
        if (isRoot) restoredRootId = cloned.id;
      }

      await tx.noteTagMap.deleteMany({ where: { noteId: { in: subtreeIds } } });
      await tx.attachment.deleteMany({ where: { noteId: { in: subtreeIds } } });
      await tx.noteShare.deleteMany({ where: { noteId: { in: subtreeIds } } });
      await tx.notePin.deleteMany({ where: { noteId: { in: subtreeIds } } });
      await tx.notePublicLink.deleteMany({
        where: { noteId: { in: subtreeIds } },
      });
      await tx.note.deleteMany({ where: { id: { in: subtreeIds } } });
      await tx.activityLog.create({
        data: {
          userId,
          action: 'note.restored-as-copy',
          entity: 'note',
          entityId: restoredRootId,
          meta: { sourceNoteId: root.id },
        },
      });
      return tx.note.findUniqueOrThrow({ where: { id: restoredRootId } });
    });
  }

  private orderSubtree<
    T extends { id: string; parentId: string | null; position: number },
  >(rootId: string, notes: Map<string, T>) {
    const ordered: T[] = [];
    const visit = (id: string) => {
      const note = notes.get(id);
      if (!note) return;
      ordered.push(note);
      [...notes.values()]
        .filter((child) => child.parentId === id)
        .sort((a, b) => a.position - b.position)
        .forEach((child) => visit(child.id));
    };
    visit(rootId);
    return ordered;
  }

  private async assertOwner(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, deletedAt: null },
    });
    if (!note) throw new ForbiddenException('You cannot access this note');
    if (note.projectId) {
      await this.projectAuthorization.assertPermission(
        userId,
        note.projectId,
        Permission.projectManageMembers,
      );
    } else if (note.userId !== userId) {
      throw new ForbiddenException('Only the note owner can do that');
    }
    return note;
  }

  private async assertStandaloneOwner(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId, projectId: null, deletedAt: null },
    });
    if (!note) {
      throw new ForbiddenException(
        'Direct user sharing is only available for standalone notes',
      );
    }
    return note;
  }

  private async assertReadable(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, deletedAt: null },
    });
    if (!note) throw new ForbiddenException('You cannot access this note');
    if (note.projectId) {
      await this.projectAuthorization.assertPermission(
        userId,
        note.projectId,
        Permission.projectRead,
      );
    } else if (
      note.userId !== userId &&
      !(await this.prisma.noteShare.findFirst({ where: { noteId, userId } }))
    ) {
      throw new ForbiddenException('You cannot access this note');
    }
    return note;
  }

  private async assertEditable(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, deletedAt: null },
    });
    if (!note) throw new ForbiddenException('You cannot edit this note');
    await this.assertEditableRecord(userId, note);
    return note;
  }

  private async assertEditableRecord(
    userId: string,
    note: { id: string; userId: string; projectId: string | null },
  ) {
    if (note.projectId) {
      await this.projectAuthorization.assertPermission(
        userId,
        note.projectId,
        Permission.projectEdit,
      );
    } else if (
      note.userId !== userId &&
      !(await this.prisma.noteShare.findFirst({
        where: { noteId: note.id, userId, permission: NotePermission.editor },
      }))
    ) {
      throw new ForbiddenException('You cannot edit this note');
    }
  }

  private async descendants(noteId: string, projectId: string | null) {
    return this.prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        content: string;
        parentId: string | null;
        position: number;
        updatedAt: Date;
      }>
    >(Prisma.sql`
      WITH RECURSIVE subtree AS (
        SELECT "id", "title", "content", "parentId", "position", "updatedAt" FROM "Note"
        WHERE "parentId" = ${noteId} AND "projectId" IS NOT DISTINCT FROM ${projectId} AND "deletedAt" IS NULL
        UNION ALL
        SELECT child."id", child."title", child."content", child."parentId", child."position", child."updatedAt"
        FROM "Note" child
        INNER JOIN subtree parent ON child."parentId" = parent."id"
        WHERE child."projectId" IS NOT DISTINCT FROM ${projectId} AND child."deletedAt" IS NULL
      )
      SELECT * FROM subtree ORDER BY "position" ASC
    `);
  }

  private async descendantIds(noteId: string, projectId: string | null) {
    return this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      WITH RECURSIVE subtree AS (
        SELECT "id" FROM "Note"
        WHERE "parentId" = ${noteId}
          AND "projectId" IS NOT DISTINCT FROM ${projectId}
          AND "deletedAt" IS NULL
        UNION ALL
        SELECT child."id" FROM "Note" child
        INNER JOIN subtree parent ON child."parentId" = parent."id"
        WHERE child."projectId" IS NOT DISTINCT FROM ${projectId}
          AND child."deletedAt" IS NULL
      )
      SELECT "id" FROM subtree
    `);
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private toPublicNote(note: {
    id: string;
    title: string;
    content: string;
    parentId: string | null;
    position: number;
    updatedAt: Date;
  }) {
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      parentId: note.parentId,
      position: note.position,
      updatedAt: note.updatedAt,
    };
  }

  private async audit(
    userId: string,
    action: string,
    entityId: string,
    meta?: Prisma.InputJsonValue,
  ) {
    await this.prisma.activityLog.create({
      data: { userId, action, entity: 'note', entityId, meta },
    });
  }
}
