import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NoteSharingService } from './note-sharing.service';

describe('NoteSharingService', () => {
  const prisma = {
    note: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    notePublicLink: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    noteShare: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
      findFirstOrThrow: jest.fn(),
    },
    noteTagMap: {
      deleteMany: jest.fn(),
    },
    attachment: {
      deleteMany: jest.fn(),
    },
    notePin: {
      deleteMany: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
    },
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  } as unknown as jest.Mocked<PrismaService>;
  const service = new NoteSharingService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('stores a hash instead of the public token', async () => {
    prisma.note.findFirst.mockResolvedValue({
      id: 'note-id',
      userId: 'owner-id',
    } as never);
    prisma.notePublicLink.upsert.mockImplementation(
      async ({ create }) => create as never,
    );

    const result = await service.createPublicLink('owner-id', {
      noteId: 'note-id',
      includeChildren: true,
    });

    expect(result.token).toBeTruthy();
    expect(prisma.notePublicLink.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          tokenHash: expect.not.stringMatching(result.token),
          includeChildren: true,
        }),
      }),
    );
  });

  it('only lets the owner create a public link', async () => {
    prisma.note.findFirst.mockResolvedValue(null);

    await expect(
      service.createPublicLink('other-user', { noteId: 'note-id' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects revoked or unknown public links', async () => {
    prisma.notePublicLink.findFirst.mockResolvedValue(null);

    await expect(service.publicNote('invalid-token')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('materializes registered-user access across the shared subtree', async () => {
    prisma.note.findFirst.mockResolvedValue({
      id: 'parent-id',
      userId: 'owner-id',
    } as never);
    prisma.user.findFirst.mockResolvedValue({
      id: 'viewer-id',
      email: 'viewer@example.com',
    } as never);
    prisma.$queryRaw.mockResolvedValue([
      { id: 'child-id' },
      { id: 'grandchild-id' },
    ] as never);
    prisma.noteShare.findFirstOrThrow.mockResolvedValue({
      noteId: 'parent-id',
      userId: 'viewer-id',
    } as never);
    prisma.$transaction.mockImplementation(async (callback) =>
      callback(prisma as never),
    );

    await service.shareWithUser('owner-id', {
      noteId: 'parent-id',
      email: 'viewer@example.com',
      permission: 'viewer' as never,
      includeChildren: true,
    });

    expect(prisma.noteShare.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ noteId: 'parent-id' }),
        expect.objectContaining({ noteId: 'child-id' }),
        expect.objectContaining({ noteId: 'grandchild-id' }),
      ]),
    });
  });

  it('revokes only grants sourced from the selected parent share', async () => {
    prisma.note.findFirst.mockResolvedValue({
      id: 'parent-id',
      userId: 'owner-id',
    } as never);
    prisma.noteShare.deleteMany.mockResolvedValue({ count: 3 });

    await service.removeShare('owner-id', 'parent-id', 'viewer-id');

    expect(prisma.noteShare.deleteMany).toHaveBeenCalledWith({
      where: { sourceNoteId: 'parent-id', userId: 'viewer-id' },
    });
  });

  it('restores a deleted root note in place', async () => {
    const deletedAt = new Date();
    prisma.note.findFirst.mockResolvedValue({
      id: 'root-id',
      userId: 'owner-id',
      parentId: null,
      deletedAt,
    } as never);
    prisma.note.findUniqueOrThrow.mockResolvedValue({
      id: 'root-id',
    } as never);

    const restored = await service.restore('owner-id', 'root-id');

    expect(restored.id).toBe('root-id');
    expect(prisma.$executeRaw).toHaveBeenCalled();
    expect(prisma.note.create).not.toHaveBeenCalled();
  });

  it('restores a deleted child subtree as a new root tree', async () => {
    const deletedAt = new Date();
    prisma.note.findFirst
      .mockResolvedValueOnce({
        id: 'child-id',
        userId: 'owner-id',
        parentId: 'deleted-parent-id',
        deletedAt,
      } as never)
      .mockResolvedValueOnce({ id: 'deleted-parent-id' } as never)
      .mockResolvedValueOnce({ position: 2 } as never);
    prisma.$queryRaw.mockResolvedValue([{ id: 'child-id' }] as never);
    prisma.note.findMany.mockResolvedValue([
      {
        id: 'child-id',
        userId: 'owner-id',
        customerId: null,
        parentId: 'deleted-parent-id',
        title: 'Child',
        content: 'Content',
        position: 0,
        tags: [],
        attachments: [],
        pins: [],
      },
    ] as never);
    prisma.note.create.mockResolvedValue({ id: 'new-root-id' } as never);
    prisma.note.findUniqueOrThrow.mockResolvedValue({
      id: 'new-root-id',
    } as never);
    prisma.$transaction.mockImplementation(async (callback) =>
      callback(prisma as never),
    );

    const restored = await service.restore('owner-id', 'child-id');

    expect(restored.id).toBe('new-root-id');
    expect(prisma.note.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        parentId: null,
        title: 'Child',
        position: 3,
      }),
    });
    expect(prisma.note.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['child-id'] } },
    });
  });
});
