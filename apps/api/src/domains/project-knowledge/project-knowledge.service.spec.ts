import { ProjectKnowledgeService } from './project-knowledge.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ProjectAuthorizationService } from '../../core/authorization/project-authorization.service';

describe('ProjectKnowledgeService', () => {
  it('returns the linked task when an action item was already promoted', async () => {
    const promotedTask = {
      id: 'task-1',
      title: 'Ship release',
      status: 'todo',
    };
    const prisma = {
      actionItem: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'action-1',
          deletedAt: null,
          promotedTask,
          meeting: { id: 'meeting-1', projectId: 'project-1', deletedAt: null },
        }),
      },
      $transaction: jest.fn(),
    } as unknown as PrismaService;
    const authorization = {
      assertPermission: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProjectAuthorizationService;
    const service = new ProjectKnowledgeService(prisma, authorization);

    await expect(service.promote('user-1', 'action-1')).resolves.toBe(
      promotedTask,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('requires edit permission before listing deleted entities', async () => {
    const prisma = {
      decision: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    } as unknown as PrismaService;
    const authorization = {
      assertPermission: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProjectAuthorizationService;
    const service = new ProjectKnowledgeService(prisma, authorization);

    await service.decisions(
      'user-1',
      'project-1',
      { includeDeleted: true },
      {},
    );

    expect(authorization.assertPermission).toHaveBeenCalledTimes(2);
  });

  it('removes a duplicate task when another promote request links first', async () => {
    const linkedTask = { id: 'task-linked', title: 'Ship release' };
    const tx = {
      actionItem: {
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValueOnce({ promotedTask: null })
          .mockResolvedValueOnce({ promotedTask: linkedTask }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      projectColumn: {
        findFirst: jest.fn().mockResolvedValue({ key: 'todo' }),
      },
      task: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'task-duplicate' }),
        delete: jest.fn().mockResolvedValue({ id: 'task-duplicate' }),
      },
    };
    const prisma = {
      actionItem: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'action-1',
          title: 'Ship release',
          deletedAt: null,
          promotedTask: null,
          meeting: { projectId: 'project-1', deletedAt: null },
        }),
      },
      activityLog: { create: jest.fn() },
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
    } as unknown as PrismaService;
    const authorization = {
      assertPermission: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProjectAuthorizationService;
    const service = new ProjectKnowledgeService(prisma, authorization);

    await expect(service.promote('user-1', 'action-1')).resolves.toBe(
      linkedTask,
    );
    expect(tx.task.delete).toHaveBeenCalledWith({
      where: { id: 'task-duplicate' },
    });
  });
});
