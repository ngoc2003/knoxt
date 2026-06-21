import { ProjectKnowledgeService } from './project-knowledge.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ProjectAuthorizationService } from '../../core/authorization/project-authorization.service';
import { ProjectKnowledgeType } from '../../core/common/enum/enums';
import type { MeetingIntelligenceProvider } from './meeting-intelligence.provider';

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

  it('keeps search scoped to the requested project and ranks title matches first', async () => {
    const older = new Date('2026-06-20T09:00:00.000Z');
    const newer = new Date('2026-06-21T09:00:00.000Z');
    const prisma = {
      note: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'note-1',
            projectId: 'project-1',
            title: 'Weekly notes',
            content: 'Launch checklist',
            updatedAt: newer,
          },
        ]),
      },
      actionItem: { findMany: jest.fn().mockResolvedValue([]) },
      decision: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'decision-1',
            projectId: 'project-1',
            title: 'Launch approval',
            description: 'Approved',
            status: 'accepted',
            updatedAt: older,
          },
        ]),
      },
      meeting: { findMany: jest.fn().mockResolvedValue([]) },
      requirement: { findMany: jest.fn().mockResolvedValue([]) },
    } as unknown as PrismaService;
    const authorization = {
      assertPermission: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProjectAuthorizationService;
    const service = new ProjectKnowledgeService(prisma, authorization);

    const result = await service.search(
      'user-1',
      { projectId: 'project-1', query: 'launch' },
      {},
    );

    expect(prisma.note.findMany).toHaveBeenCalledWith({
      where: {
        projectId: 'project-1',
        deletedAt: null,
        OR: [
          { title: { contains: 'launch', mode: 'insensitive' } },
          { content: { contains: 'launch', mode: 'insensitive' } },
        ],
      },
    });
    expect(result.items.map((item) => item.id)).toEqual([
      'decision-1',
      'note-1',
    ]);
    expect(result.items.every((item) => item.projectId === 'project-1')).toBe(
      true,
    );
  });

  it('searches only the requested knowledge types', async () => {
    const prisma = {
      note: { findMany: jest.fn() },
      actionItem: { findMany: jest.fn() },
      decision: { findMany: jest.fn().mockResolvedValue([]) },
      meeting: { findMany: jest.fn() },
      requirement: { findMany: jest.fn() },
    } as unknown as PrismaService;
    const authorization = {
      assertPermission: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProjectAuthorizationService;
    const service = new ProjectKnowledgeService(prisma, authorization);

    await service.search(
      'user-1',
      {
        projectId: 'project-1',
        query: 'launch',
        types: [ProjectKnowledgeType.decision],
      },
      {},
    );

    expect(prisma.decision.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.note.findMany).not.toHaveBeenCalled();
    expect(prisma.actionItem.findMany).not.toHaveBeenCalled();
    expect(prisma.meeting.findMany).not.toHaveBeenCalled();
    expect(prisma.requirement.findMany).not.toHaveBeenCalled();
  });

  it('includes action items in project-scoped search', async () => {
    const updatedAt = new Date('2026-06-21T09:00:00.000Z');
    const prisma = {
      note: { findMany: jest.fn() },
      actionItem: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'action-1',
            title: 'Send launch proposal',
            description: null,
            status: 'open',
            updatedAt,
          },
        ]),
      },
      decision: { findMany: jest.fn() },
      meeting: { findMany: jest.fn() },
      requirement: { findMany: jest.fn() },
    } as unknown as PrismaService;
    const authorization = {
      assertPermission: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProjectAuthorizationService;
    const service = new ProjectKnowledgeService(prisma, authorization);

    const result = await service.search(
      'user-1',
      {
        projectId: 'project-1',
        query: 'launch',
        types: [ProjectKnowledgeType.action],
      },
      {},
    );

    expect(prisma.actionItem.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        meeting: { projectId: 'project-1', deletedAt: null },
        OR: [
          { title: { contains: 'launch', mode: 'insensitive' } },
          { description: { contains: 'launch', mode: 'insensitive' } },
          {
            externalAssigneeName: {
              contains: 'launch',
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    expect(result.items[0]).toMatchObject({
      id: 'action-1',
      projectId: 'project-1',
      type: ProjectKnowledgeType.action,
      title: 'Send launch proposal',
      status: 'open',
    });
  });

  it('rejects short meeting transcripts', async () => {
    const prisma = {} as unknown as PrismaService;
    const authorization = {
      assertPermission: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProjectAuthorizationService;
    const provider = {
      analyzeTranscript: jest.fn(),
    } as unknown as MeetingIntelligenceProvider;
    const service = new ProjectKnowledgeService(
      prisma,
      authorization,
      provider,
    );

    await expect(
      service.analyzeMeetingTranscript('user-1', {
        projectId: 'project-1',
        transcript: 'too short',
      }),
    ).rejects.toThrow('Transcript must contain at least 20 characters');
    expect(provider.analyzeTranscript).not.toHaveBeenCalled();
  });

  it('normalizes a meeting intelligence draft from the provider', async () => {
    const prisma = {} as unknown as PrismaService;
    const authorization = {
      assertPermission: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProjectAuthorizationService;
    const provider = {
      analyzeTranscript: jest.fn().mockResolvedValue({
        title: ' Planning sync ',
        summary: ' Agreed launch scope ',
        decisions: [
          {
            title: ' Use Stripe ',
            description: ' Stripe is simpler ',
            reason: '',
          },
        ],
        actionItems: [
          {
            title: ' Send proposal ',
            description: ' Send by Friday ',
            externalAssigneeName: ' Mina ',
            dueDate: null,
          },
        ],
        warnings: [' Check dates '],
      }),
    } as unknown as MeetingIntelligenceProvider;
    const service = new ProjectKnowledgeService(
      prisma,
      authorization,
      provider,
    );

    await expect(
      service.analyzeMeetingTranscript('user-1', {
        projectId: 'project-1',
        transcript:
          'Planning sync transcript with enough characters to analyze well.',
      }),
    ).resolves.toMatchObject({
      title: 'Planning sync',
      summary: 'Agreed launch scope',
      decisions: [{ title: 'Use Stripe', reason: null }],
      actionItems: [{ title: 'Send proposal', externalAssigneeName: 'Mina' }],
      warnings: ['Check dates'],
    });
  });

  it('throws a safe error when meeting intelligence returns malformed output', async () => {
    const prisma = {} as unknown as PrismaService;
    const authorization = {
      assertPermission: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProjectAuthorizationService;
    const provider = {
      analyzeTranscript: jest.fn().mockResolvedValue({
        title: '',
        summary: '',
        decisions: [],
        actionItems: [],
        warnings: [],
      }),
    } as unknown as MeetingIntelligenceProvider;
    const service = new ProjectKnowledgeService(
      prisma,
      authorization,
      provider,
    );

    await expect(
      service.analyzeMeetingTranscript('user-1', {
        projectId: 'project-1',
        transcript:
          'Planning sync transcript with enough characters to analyze well.',
      }),
    ).rejects.toThrow('AI returned an empty meeting draft');
  });

  it('saves meeting intelligence drafts transactionally', async () => {
    const meeting = { id: 'meeting-1', projectId: 'project-1' };
    const tx = {
      meeting: {
        create: jest.fn().mockResolvedValue(meeting),
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          ...meeting,
          title: 'Planning sync',
          actionItems: [{ id: 'action-1' }],
          participants: [],
        }),
      },
      decision: { create: jest.fn().mockResolvedValue({ id: 'decision-1' }) },
      actionItem: { create: jest.fn().mockResolvedValue({ id: 'action-1' }) },
      activityLog: {
        create: jest.fn().mockResolvedValue({ id: 'activity-1' }),
      },
    };
    const prisma = {
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
    } as unknown as PrismaService;
    const authorization = {
      assertPermission: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProjectAuthorizationService;
    const service = new ProjectKnowledgeService(prisma, authorization);

    await expect(
      service.saveMeetingIntelligenceDraft('user-1', {
        projectId: 'project-1',
        title: 'Planning sync',
        summary: 'Agreed launch scope',
        decisions: [{ title: 'Use Stripe', description: 'Stripe is simpler' }],
        actionItems: [{ title: 'Send proposal', description: 'By Friday' }],
      }),
    ).resolves.toMatchObject({ id: 'meeting-1' });
    expect(tx.meeting.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: 'project-1',
          createdById: 'user-1',
          status: 'completed',
        }),
      }),
    );
    expect(tx.decision.create).toHaveBeenCalledTimes(1);
    expect(tx.actionItem.create).toHaveBeenCalledTimes(1);
    expect(tx.activityLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'meeting-intelligence.saved',
        entityId: 'meeting-1',
      }),
    });
  });
});
