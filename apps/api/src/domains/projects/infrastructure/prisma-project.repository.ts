import { Injectable } from '@nestjs/common';
import { Prisma } from 'database/generated/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { PaginationInput } from '../../../core/common/dtos/pagination.dto';
import type {
  AddProjectMemberInput,
  CancelProjectInvitationInput,
  CreateProjectColumnInput,
  CreateProjectInput,
  RemoveProjectMemberInput,
  ReorderProjectColumnsInput,
  UpdateProjectMemberRoleInput,
  UpdateProjectInput,
} from '../dto/project.dto';
import type {
  IProjectRepository,
  ProjectWithRelations,
} from '../application/ports/project.repository';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  private accessibleBy(userId: string): Prisma.ProjectWhereInput {
    return {
      OR: [{ userId }, { members: { some: { userId } } }],
    };
  }

  private toCreateData(
    userId: string,
    data: Omit<CreateProjectInput, 'budget'>,
  ) {
    const { endDate, startDate, ...rest } = data;
    return {
      ...rest,
      userId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      columns: {
        create: [
          { key: 'todo', name: 'To-do', orderIndex: 0 },
          { key: 'doing', name: 'Doing', orderIndex: 1 },
          { key: 'done', name: 'Done', orderIndex: 2 },
        ],
      },
    };
  }

  async create(userId: string, data: Omit<CreateProjectInput, 'budget'>) {
    return this.prisma.project.create({
      data: this.toCreateData(userId, data),
    });
  }

  async findAll(
    userId: string,
    pagination: PaginationInput,
    customerId?: string,
  ) {
    const where: Prisma.ProjectWhereInput = {
      deletedAt: null,
      ...this.accessibleBy(userId),
      ...(customerId && { customerId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: pagination.skip ?? 0,
        take: pagination.take ?? 20,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          user: true,
          incomes: true,
          columns: { orderBy: { orderIndex: 'asc' } },
          tasks: {
            where: { deletedAt: null },
            orderBy: { orderIndex: 'asc' },
            include: { assignee: true },
          },
          members: { include: { user: true }, orderBy: { createdAt: 'asc' } },
          invitations: { orderBy: { createdAt: 'asc' } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items: items as ProjectWithRelations[],
      total,
      skip: pagination.skip ?? 0,
      take: pagination.take ?? 20,
    };
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null, ...this.accessibleBy(userId) },
      include: {
        customer: true,
        user: true,
        tasks: {
          where: { deletedAt: null },
          orderBy: { orderIndex: 'asc' },
          include: { assignee: true, tags: { include: { tag: true } } },
        },
        incomes: true,
        columns: { orderBy: { orderIndex: 'asc' } },
        members: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        invitations: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!project) return null;

    return {
      ...project,
      tasks: project.tasks.map((task) => ({
        ...task,
        tags: task.tags.map((t) => t.tag),
      })),
    } as unknown as ProjectWithRelations;
  }

  async update(userId: string, id: string, data: UpdateProjectInput) {
    return this.prisma.project.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.startDate !== undefined
          ? { startDate: new Date(data.startDate) }
          : {}),
        ...(data.endDate !== undefined
          ? { endDate: data.endDate ? new Date(data.endDate) : null }
          : {}),
      },
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async createColumn(userId: string, data: CreateProjectColumnInput) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: data.projectId,
        deletedAt: null,
        ...this.accessibleBy(userId),
      },
      include: { columns: true },
    });
    if (!project) return null;

    const name = data.name.trim();
    const baseKey =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'column';
    const keys = new Set(project.columns.map((column) => column.key));
    let key = baseKey;
    let suffix = 2;
    while (keys.has(key)) key = `${baseKey}-${suffix++}`;

    const maxOrder = project.columns.reduce(
      (max, column) => Math.max(max, column.orderIndex),
      -1,
    );

    return this.prisma.projectColumn.create({
      data: {
        projectId: project.id,
        key,
        name,
        orderIndex: data.orderIndex ?? maxOrder + 1,
      },
    });
  }

  async reorderColumns(data: ReorderProjectColumnsInput) {
    await this.prisma.$transaction(
      data.columnIds.map((id, orderIndex) =>
        this.prisma.projectColumn.update({
          where: { id },
          data: { orderIndex },
        }),
      ),
    );

    return this.prisma.projectColumn.findMany({
      where: { projectId: data.projectId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async addMember(data: AddProjectMemberInput) {
    const user = await this.findUserByEmail(data.email);
    if (!user) return null;
    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
      select: { userId: true },
    });
    if (!project || project.userId === user.id) return null;

    const [member] = await this.prisma.$transaction([
      this.prisma.projectMember.upsert({
        where: {
          projectId_userId: { projectId: data.projectId, userId: user.id },
        },
        create: {
          projectId: data.projectId,
          userId: user.id,
          role: data.role,
        },
        update: { role: data.role },
        include: { user: true },
      }),
      this.prisma.projectInvitation.deleteMany({
        where: {
          projectId: data.projectId,
          email: { equals: user.email, mode: 'insensitive' },
        },
      }),
    ]);
    return member;
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
  }

  async createInvitation(invitedById: string, data: AddProjectMemberInput) {
    const email = data.email.toLowerCase();
    return this.prisma.projectInvitation.upsert({
      where: { projectId_email: { projectId: data.projectId, email } },
      create: {
        projectId: data.projectId,
        invitedById,
        email,
        role: data.role,
      },
      update: { invitedById, role: data.role },
    });
  }

  async updateMemberRole(data: UpdateProjectMemberRoleInput) {
    const member = await this.prisma.projectMember.findFirst({
      where: { id: data.memberId, projectId: data.projectId },
    });
    if (!member) return null;

    return this.prisma.projectMember.update({
      where: { id: member.id },
      data: { role: data.role },
      include: { user: true },
    });
  }

  async removeMember(data: RemoveProjectMemberInput) {
    const member = await this.prisma.projectMember.findFirst({
      where: { id: data.memberId, projectId: data.projectId },
    });
    if (!member) return null;

    const [, deletedMember] = await this.prisma.$transaction([
      this.prisma.task.updateMany({
        where: { projectId: data.projectId, assigneeId: member.userId },
        data: { assigneeId: null },
      }),
      this.prisma.projectMember.delete({
        where: { id: member.id },
        include: { user: true },
      }),
    ]);
    return deletedMember;
  }

  async cancelInvitation(data: CancelProjectInvitationInput) {
    const invitation = await this.prisma.projectInvitation.findFirst({
      where: { id: data.invitationId, projectId: data.projectId },
    });
    if (!invitation) return null;
    return this.prisma.projectInvitation.delete({
      where: { id: invitation.id },
    });
  }
}
