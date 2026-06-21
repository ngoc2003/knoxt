import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'database/generated/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ProjectAuthorizationService } from '../../core/authorization/project-authorization.service';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';
import { Permission, ProjectKnowledgeType } from '../../core/common/enum/enums';
import {
  AddMeetingParticipantInput,
  CreateActionItemInput,
  CreateDecisionInput,
  CreateMeetingInput,
  CreateRequirementInput,
  ProjectKnowledgeSearchInput,
  StructuredFilterInput,
  UpdateActionItemInput,
  UpdateDecisionInput,
  UpdateMeetingInput,
  UpdateRequirementInput,
} from './project-knowledge.dto';
import { nextOrderKey } from '../tasks/infrastructure/task-order-key';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-function-type */
@Injectable()
export class ProjectKnowledgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: ProjectAuthorizationService,
  ) {}

  async decisions(
    userId: string,
    projectId: string,
    filter: StructuredFilterInput,
    page: PaginationInput,
  ) {
    await this.read(userId, projectId);
    if (filter.includeDeleted) await this.edit(userId, projectId);
    const where: Prisma.DecisionWhereInput = {
      projectId,
      ...(filter.includeDeleted ? {} : { deletedAt: null }),
      ...(filter.statuses?.length
        ? { status: { in: filter.statuses as never } }
        : {}),
      ...(filter.from || filter.to
        ? { decidedAt: { gte: filter.from, lte: filter.to } }
        : {}),
      ...(filter.search
        ? {
            OR: ['title', 'description', 'reason', 'impact'].map((field) => ({
              [field]: { contains: filter.search, mode: 'insensitive' },
            })),
          }
        : {}),
    };
    return this.page(this.prisma.decision, where, page, {
      updatedAt: 'desc',
    });
  }

  async decision(userId: string, id: string) {
    const entity = await this.prisma.decision.findUnique({ where: { id } });
    if (!entity) throw new NotFoundException('Decision not found');
    await this.read(userId, entity.projectId);
    return entity;
  }

  async createDecision(userId: string, data: CreateDecisionInput) {
    await this.edit(userId, data.projectId);
    await this.sourceNote(data.projectId, data.sourceNoteId);
    const entity = await this.prisma.decision.create({
      data: {
        ...data,
        title: this.title(data.title),
        createdById: userId,
        status: data.status as never,
      },
    });
    await this.audit(
      userId,
      data.projectId,
      'decision.created',
      'decision',
      entity.id,
    );
    return entity;
  }

  async updateDecision(userId: string, id: string, data: UpdateDecisionInput) {
    const existing = await this.decision(userId, id);
    await this.edit(userId, existing.projectId);
    await this.sourceNote(existing.projectId, data.sourceNoteId);
    const entity = await this.prisma.decision.update({
      where: { id },
      data: {
        ...data,
        ...(data.title !== undefined ? { title: this.title(data.title) } : {}),
        status: data.status as never,
      },
    });
    await this.audit(
      userId,
      existing.projectId,
      'decision.updated',
      'decision',
      id,
    );
    return entity;
  }

  async removeDecision(userId: string, id: string, restore = false) {
    const existing = await this.decision(userId, id);
    await this.edit(userId, existing.projectId);
    const entity = await this.prisma.decision.update({
      where: { id },
      data: { deletedAt: restore ? null : new Date() },
    });
    await this.audit(
      userId,
      existing.projectId,
      `decision.${restore ? 'restored' : 'deleted'}`,
      'decision',
      id,
    );
    return entity;
  }

  async meetings(
    userId: string,
    projectId: string,
    filter: StructuredFilterInput,
    page: PaginationInput,
  ) {
    await this.read(userId, projectId);
    if (filter.includeDeleted) await this.edit(userId, projectId);
    const where: Prisma.MeetingWhereInput = {
      projectId,
      ...(filter.includeDeleted ? {} : { deletedAt: null }),
      ...(filter.statuses?.length
        ? { status: { in: filter.statuses as never } }
        : {}),
      ...(filter.from || filter.to
        ? { scheduledAt: { gte: filter.from, lte: filter.to } }
        : {}),
      ...(filter.search
        ? {
            OR: ['title', 'summary'].map((field) => ({
              [field]: { contains: filter.search, mode: 'insensitive' },
            })),
          }
        : {}),
    };
    return this.page(
      this.prisma.meeting,
      where,
      page,
      {
        scheduledAt: 'desc',
      },
      this.meetingInclude(filter.includeDeleted),
    );
  }

  async meeting(userId: string, id: string) {
    const entity = await this.prisma.meeting.findUnique({
      where: { id },
      include: this.meetingInclude(),
    });
    if (!entity) throw new NotFoundException('Meeting not found');
    await this.read(userId, entity.projectId);
    return entity;
  }

  async createMeeting(userId: string, data: CreateMeetingInput) {
    await this.edit(userId, data.projectId);
    await this.sourceNote(data.projectId, data.sourceNoteId);
    const entity = await this.prisma.meeting.create({
      data: {
        ...data,
        title: this.title(data.title),
        createdById: userId,
        status: data.status as never,
      },
      include: this.meetingInclude(),
    });
    await this.audit(
      userId,
      data.projectId,
      'meeting.created',
      'meeting',
      entity.id,
    );
    return entity;
  }

  async updateMeeting(userId: string, id: string, data: UpdateMeetingInput) {
    const existing = await this.meeting(userId, id);
    await this.edit(userId, existing.projectId);
    await this.sourceNote(existing.projectId, data.sourceNoteId);
    const entity = await this.prisma.meeting.update({
      where: { id },
      data: {
        ...data,
        ...(data.title !== undefined ? { title: this.title(data.title) } : {}),
        status: data.status as never,
      },
      include: this.meetingInclude(),
    });
    await this.audit(
      userId,
      existing.projectId,
      'meeting.updated',
      'meeting',
      id,
    );
    return entity;
  }

  async removeMeeting(userId: string, id: string, restore = false) {
    const existing = await this.meeting(userId, id);
    await this.edit(userId, existing.projectId);
    const entity = await this.prisma.meeting.update({
      where: { id },
      data: { deletedAt: restore ? null : new Date() },
      include: this.meetingInclude(),
    });
    await this.audit(
      userId,
      existing.projectId,
      `meeting.${restore ? 'restored' : 'deleted'}`,
      'meeting',
      id,
    );
    return entity;
  }

  async addParticipant(userId: string, data: AddMeetingParticipantInput) {
    const meeting = await this.meeting(userId, data.meetingId);
    await this.edit(userId, meeting.projectId);
    if (Boolean(data.userId) === Boolean(data.externalName?.trim())) {
      throw new BadRequestException(
        'Choose either an internal or external participant',
      );
    }
    if (data.userId) await this.member(meeting.projectId, data.userId);
    const entity = await this.prisma.meetingParticipant.create({
      data: { ...data, externalName: data.externalName?.trim() },
      include: { user: true },
    });
    await this.audit(
      userId,
      meeting.projectId,
      'meeting.participant-added',
      'meeting',
      meeting.id,
    );
    return entity;
  }

  async removeParticipant(userId: string, id: string) {
    const participant = await this.prisma.meetingParticipant.findUnique({
      where: { id },
      include: { meeting: true },
    });
    if (!participant) throw new NotFoundException('Participant not found');
    await this.edit(userId, participant.meeting.projectId);
    await this.audit(
      userId,
      participant.meeting.projectId,
      'meeting.participant-removed',
      'meeting',
      participant.meetingId,
    );
    return this.prisma.meetingParticipant.delete({
      where: { id },
      include: { user: true },
    });
  }

  async createActionItem(userId: string, data: CreateActionItemInput) {
    const meeting = await this.meeting(userId, data.meetingId);
    await this.edit(userId, meeting.projectId);
    this.assignee(data.assigneeId, data.externalAssigneeName);
    if (data.assigneeId) await this.member(meeting.projectId, data.assigneeId);
    const entity = await this.prisma.actionItem.create({
      data: {
        ...data,
        title: this.title(data.title),
        createdById: userId,
        status: data.status as never,
      },
      include: { assignee: true, promotedTask: true },
    });
    await this.audit(
      userId,
      meeting.projectId,
      'action-item.created',
      'action-item',
      entity.id,
    );
    return entity;
  }

  async updateActionItem(
    userId: string,
    id: string,
    data: UpdateActionItemInput,
  ) {
    const existing = await this.actionItem(id);
    await this.edit(userId, existing.meeting.projectId);
    this.assignee(data.assigneeId, data.externalAssigneeName);
    if (data.assigneeId)
      await this.member(existing.meeting.projectId, data.assigneeId);
    const assigneeData =
      data.externalAssigneeName !== undefined && data.assigneeId === undefined
        ? { assigneeId: null }
        : data.assigneeId
          ? { externalAssigneeName: null }
          : {};
    const entity = await this.prisma.actionItem.update({
      where: { id },
      data: {
        ...data,
        ...assigneeData,
        ...(data.title !== undefined ? { title: this.title(data.title) } : {}),
        status: data.status as never,
      },
      include: { assignee: true, promotedTask: true },
    });
    await this.audit(
      userId,
      existing.meeting.projectId,
      'action-item.updated',
      'action-item',
      id,
    );
    return entity;
  }

  async removeActionItem(userId: string, id: string, restore = false) {
    const existing = await this.actionItem(id);
    await this.edit(userId, existing.meeting.projectId);
    const entity = await this.prisma.actionItem.update({
      where: { id },
      data: { deletedAt: restore ? null : new Date() },
      include: { assignee: true, promotedTask: true },
    });
    await this.audit(
      userId,
      existing.meeting.projectId,
      `action-item.${restore ? 'restored' : 'deleted'}`,
      'action-item',
      id,
    );
    return entity;
  }

  async promote(userId: string, id: string) {
    const item = await this.actionItem(id);
    if (item.deletedAt || item.meeting.deletedAt)
      throw new BadRequestException('Deleted action items cannot be promoted');
    await this.edit(userId, item.meeting.projectId);
    if (item.promotedTask) return item.promotedTask;
    const task = await this.prisma.$transaction(async (tx) => {
      const current = await tx.actionItem.findUniqueOrThrow({
        where: { id },
        include: { promotedTask: true },
      });
      if (current.promotedTask) return current.promotedTask;
      const column = await tx.projectColumn.findFirst({
        where: { projectId: item.meeting.projectId },
        orderBy: { orderIndex: 'asc' },
      });
      if (!column) throw new BadRequestException('Project has no task column');
      const last = await tx.task.findFirst({
        where: {
          projectId: item.meeting.projectId,
          status: column.key,
          deletedAt: null,
        },
        orderBy: { orderKey: 'desc' },
      });
      const created = await tx.task.create({
        data: {
          userId,
          projectId: item.meeting.projectId,
          title: item.title,
          description: item.description,
          assigneeId: item.assigneeId,
          dueDate: item.dueDate,
          status: column.key,
          priority: 'medium',
          orderKey: nextOrderKey(last?.orderKey) ?? `${Date.now()}`.slice(-16),
        },
      });
      const linked = await tx.actionItem.updateMany({
        where: { id, promotedTaskId: null },
        data: { promotedTaskId: created.id },
      });
      if (linked.count === 0) {
        await tx.task.delete({ where: { id: created.id } });
        return (
          await tx.actionItem.findUniqueOrThrow({
            where: { id },
            include: { promotedTask: true },
          })
        ).promotedTask!;
      }
      return created;
    });
    await this.audit(
      userId,
      item.meeting.projectId,
      'action-item.promoted',
      'action-item',
      id,
    );
    return task;
  }

  async requirements(
    userId: string,
    projectId: string,
    filter: StructuredFilterInput,
    page: PaginationInput,
  ) {
    await this.read(userId, projectId);
    if (filter.includeDeleted) await this.edit(userId, projectId);
    const where: Prisma.RequirementWhereInput = {
      projectId,
      ...(filter.includeDeleted ? {} : { deletedAt: null }),
      ...(filter.statuses?.length
        ? { status: { in: filter.statuses as never } }
        : {}),
      ...(filter.priorities?.length
        ? { priority: { in: filter.priorities as never } }
        : {}),
      ...(filter.search
        ? {
            OR: ['title', 'description'].map((field) => ({
              [field]: { contains: filter.search, mode: 'insensitive' },
            })),
          }
        : {}),
    };
    return this.page(this.prisma.requirement, where, page, {
      updatedAt: 'desc',
    });
  }

  async requirement(userId: string, id: string) {
    const entity = await this.prisma.requirement.findUnique({ where: { id } });
    if (!entity) throw new NotFoundException('Requirement not found');
    await this.read(userId, entity.projectId);
    return entity;
  }

  async createRequirement(userId: string, data: CreateRequirementInput) {
    await this.edit(userId, data.projectId);
    await this.sourceNote(data.projectId, data.sourceNoteId);
    const entity = await this.prisma.requirement.create({
      data: {
        ...data,
        title: this.title(data.title),
        createdById: userId,
        status: data.status as never,
        priority: data.priority as never,
      },
    });
    await this.audit(
      userId,
      data.projectId,
      'requirement.created',
      'requirement',
      entity.id,
    );
    return entity;
  }

  async updateRequirement(
    userId: string,
    id: string,
    data: UpdateRequirementInput,
  ) {
    const existing = await this.requirement(userId, id);
    await this.edit(userId, existing.projectId);
    await this.sourceNote(existing.projectId, data.sourceNoteId);
    const entity = await this.prisma.requirement.update({
      where: { id },
      data: {
        ...data,
        ...(data.title !== undefined ? { title: this.title(data.title) } : {}),
        status: data.status as never,
        priority: data.priority as never,
      },
    });
    await this.audit(
      userId,
      existing.projectId,
      'requirement.updated',
      'requirement',
      id,
    );
    return entity;
  }

  async removeRequirement(userId: string, id: string, restore = false) {
    const existing = await this.requirement(userId, id);
    await this.edit(userId, existing.projectId);
    const entity = await this.prisma.requirement.update({
      where: { id },
      data: { deletedAt: restore ? null : new Date() },
    });
    await this.audit(
      userId,
      existing.projectId,
      `requirement.${restore ? 'restored' : 'deleted'}`,
      'requirement',
      id,
    );
    return entity;
  }

  async search(
    userId: string,
    input: ProjectKnowledgeSearchInput,
    page: PaginationInput,
  ) {
    await this.read(userId, input.projectId);
    const query = input.query.trim();
    if (query.length < 2)
      throw new BadRequestException(
        'Search query must contain at least 2 characters',
      );
    const types = new Set(
      input.types?.length ? input.types : Object.values(ProjectKnowledgeType),
    );
    const contains = { contains: query, mode: Prisma.QueryMode.insensitive };
    const [notes, actionItems, decisions, meetings, requirements] =
      await Promise.all([
        types.has(ProjectKnowledgeType.note)
          ? this.prisma.note.findMany({
              where: {
                projectId: input.projectId,
                deletedAt: null,
                OR: [{ title: contains }, { content: contains }],
              },
            })
          : [],
        types.has(ProjectKnowledgeType.action)
          ? this.prisma.actionItem.findMany({
              where: {
                deletedAt: null,
                meeting: { projectId: input.projectId, deletedAt: null },
                OR: [
                  { title: contains },
                  { description: contains },
                  { externalAssigneeName: contains },
                ],
              },
            })
          : [],
        types.has(ProjectKnowledgeType.decision)
          ? this.prisma.decision.findMany({
              where: {
                projectId: input.projectId,
                deletedAt: null,
                OR: [
                  { title: contains },
                  { description: contains },
                  { reason: contains },
                  { impact: contains },
                ],
              },
            })
          : [],
        types.has(ProjectKnowledgeType.meeting)
          ? this.prisma.meeting.findMany({
              where: {
                projectId: input.projectId,
                deletedAt: null,
                OR: [{ title: contains }, { summary: contains }],
              },
            })
          : [],
        types.has(ProjectKnowledgeType.requirement)
          ? this.prisma.requirement.findMany({
              where: {
                projectId: input.projectId,
                deletedAt: null,
                OR: [{ title: contains }, { description: contains }],
              },
            })
          : [],
      ]);
    const rows = [
      ...notes.map((x) => ({
        ...x,
        type: ProjectKnowledgeType.note,
        text: x.content,
        status: null,
      })),
      ...actionItems.map((x) => ({
        ...x,
        type: ProjectKnowledgeType.action,
        text: x.description ?? x.title,
        status: x.status,
      })),
      ...decisions.map((x) => ({
        ...x,
        type: ProjectKnowledgeType.decision,
        text: x.description,
        status: x.status,
      })),
      ...meetings.map((x) => ({
        ...x,
        type: ProjectKnowledgeType.meeting,
        text: x.summary ?? '',
        status: x.status,
      })),
      ...requirements.map((x) => ({
        ...x,
        type: ProjectKnowledgeType.requirement,
        text: x.description,
        status: x.status,
      })),
    ].sort(
      (a, b) =>
        Number(b.title.toLowerCase().includes(query.toLowerCase())) -
          Number(a.title.toLowerCase().includes(query.toLowerCase())) ||
        b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
    const skip = page.skip ?? 0;
    const take = page.take ?? 20;
    return {
      items: rows.slice(skip, skip + take).map((x) => ({
        id: x.id,
        projectId: input.projectId,
        type: x.type,
        title: x.title,
        snippet: x.text.slice(0, 180),
        status: x.status,
        updatedAt: x.updatedAt,
      })),
      total: rows.length,
      skip,
      take,
      hasMore: skip + take < rows.length,
    };
  }

  async activity(userId: string, projectId: string, page: PaginationInput) {
    await this.authorization.assertPermission(
      userId,
      projectId,
      Permission.projectViewAudit,
    );
    const where = { projectId };
    return this.page(this.prisma.activityLog, where, page, {
      createdAt: 'desc',
    });
  }

  private meetingInclude(includeDeleted = false) {
    return {
      participants: { include: { user: true } },
      actionItems: {
        where: includeDeleted ? undefined : { deletedAt: null },
        include: { assignee: true, promotedTask: true },
        orderBy: { createdAt: 'asc' as const },
      },
    };
  }

  private async actionItem(id: string) {
    const entity = await this.prisma.actionItem.findUnique({
      where: { id },
      include: { meeting: true, promotedTask: true },
    });
    if (!entity) throw new NotFoundException('Action item not found');
    return entity;
  }

  private async page(
    model: { findMany: Function; count: Function },
    where: unknown,
    page: PaginationInput,
    orderBy: unknown,
    include?: unknown,
  ) {
    const skip = page.skip ?? 0;
    const take = page.take ?? 20;
    const [items, total] = await Promise.all([
      model.findMany({ where, orderBy, include, skip, take }),
      model.count({ where }),
    ]);
    return { items, total, skip, take, hasMore: skip + take < total };
  }

  private title(value: string) {
    const title = value.trim();
    if (!title) throw new BadRequestException('Title is required');
    return title;
  }

  private assignee(userId?: string | null, external?: string | null) {
    if (userId && external?.trim())
      throw new BadRequestException(
        'Choose either an internal or external assignee',
      );
  }

  private async sourceNote(projectId: string, sourceNoteId?: string | null) {
    if (!sourceNoteId) return;
    const note = await this.prisma.note.findFirst({
      where: { id: sourceNoteId, projectId, deletedAt: null },
      select: { id: true },
    });
    if (!note)
      throw new BadRequestException(
        'Source note must belong to the same project',
      );
  }

  private async member(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        OR: [{ userId }, { members: { some: { userId } } }],
      },
      select: { id: true },
    });
    if (!project)
      throw new BadRequestException('User must be a project member');
  }

  private read(userId: string, projectId: string) {
    return this.authorization.assertPermission(
      userId,
      projectId,
      Permission.projectRead,
    );
  }

  private edit(userId: string, projectId: string) {
    return this.authorization.assertPermission(
      userId,
      projectId,
      Permission.projectEdit,
    );
  }

  private audit(
    userId: string,
    projectId: string,
    action: string,
    entity: string,
    entityId: string,
  ) {
    return this.prisma.activityLog.create({
      data: { userId, projectId, action, entity, entityId },
    });
  }
}
