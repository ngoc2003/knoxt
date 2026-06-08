import { Injectable } from '@nestjs/common';
import { Prisma } from 'database/generated/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { PaginationInput } from '../../../core/common/dtos/pagination.dto';
import type {
  CreateTaskInput,
  ListTasksInput,
  MoveTaskInput,
  UpdateTaskInput,
} from '../dto/task.dto';
import type {
  ITaskRepository,
  TaskWithTags,
} from '../application/ports/task.repository';
import {
  nextOrderKey,
  orderKeyBetween,
  orderKeyForIndex,
} from './task-order-key';

@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  private projectAccessibleBy(userId: string): Prisma.ProjectWhereInput {
    return {
      deletedAt: null,
      OR: [{ userId }, { members: { some: { userId } } }],
    };
  }

  async resolveTagIds(userId: string, tagNames: string[]): Promise<string[]> {
    const tagRecords = await Promise.all(
      tagNames.map(async (name) => {
        const existing = await this.prisma.taskTag.findFirst({
          where: { userId, name },
        });
        if (existing) return existing;
        return this.prisma.taskTag.create({ data: { userId, name } });
      }),
    );
    return tagRecords.map((t) => t.id);
  }

  async create(userId: string, data: CreateTaskInput) {
    const { tags, ...rest } = data;
    const lastTask = await this.prisma.task.findFirst({
      where: {
        projectId: data.projectId,
        status: rest.status ?? 'todo',
        deletedAt: null,
      },
      orderBy: { orderKey: 'desc' },
      select: { orderKey: true },
    });
    let orderKey = nextOrderKey(lastTask?.orderKey);
    if (!orderKey) {
      await this.rebalanceColumn(data.projectId, rest.status ?? 'todo');
      const rebalancedLastTask = await this.prisma.task.findFirst({
        where: {
          projectId: data.projectId,
          status: rest.status ?? 'todo',
          deletedAt: null,
        },
        orderBy: { orderKey: 'desc' },
        select: { orderKey: true },
      });
      orderKey = nextOrderKey(rebalancedLastTask?.orderKey);
    }

    const tagIds = tags ? await this.resolveTagIds(userId, tags) : [];

    return this.prisma.task.create({
      data: {
        ...rest,
        userId,
        orderKey: orderKey!,
        status: rest.status ?? 'todo',
        priority: rest.priority ?? 'medium',
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: { assignee: true },
    });
  }

  async findAll(
    userId: string,
    filter: ListTasksInput,
    pagination: PaginationInput,
  ) {
    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
      project: this.projectAccessibleBy(userId),
      ...(filter.projectId && { projectId: filter.projectId }),
      ...(filter.status && { status: filter.status }),
      ...(filter.priority && { priority: filter.priority }),
      ...(filter.search && {
        title: { contains: filter.search, mode: 'insensitive' },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip: pagination.skip ?? 0,
        take: pagination.take ?? 20,
        include: { assignee: true, tags: { include: { tag: true } } },
        orderBy: [{ status: 'asc' }, { orderKey: 'asc' }],
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      items: items.map((task) => ({
        ...task,
        tags: task.tags.map((t) => t.tag),
      })) as TaskWithTags[],
      total,
      skip: pagination.skip ?? 0,
      take: pagination.take ?? 20,
    };
  }

  async findOne(userId: string, id: string) {
    return this.prisma.task.findFirst({
      where: { id, deletedAt: null, project: this.projectAccessibleBy(userId) },
      include: { assignee: true, tags: { include: { tag: true } } },
    });
  }

  async update(userId: string, id: string, data: UpdateTaskInput) {
    const { assigneeId, tags, ...rest } = data;
    const updateData: Prisma.TaskUpdateInput = { ...rest };

    if (assigneeId !== undefined) {
      updateData.assignee = assigneeId
        ? { connect: { id: assigneeId } }
        : { disconnect: true };
    }

    if (tags !== undefined) {
      const tagIds = await this.resolveTagIds(userId, tags);
      updateData.tags = {
        deleteMany: {},
        create: tagIds.map((tagId) => ({ tagId })),
      };
    }

    return this.prisma.task.update({
      where: { id },
      data: updateData,
      include: { assignee: true },
    });
  }

  async moveTask(userId: string, input: MoveTaskInput) {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUniqueOrThrow({ where: { id: input.id } });
      const destinationWhere: Prisma.TaskWhereInput = {
        projectId: task.projectId,
        status: input.status,
        deletedAt: null,
        id: { not: task.id },
      };
      const destinationCount = await tx.task.count({
        where: destinationWhere,
      });
      const targetIndex = Math.max(
        0,
        Math.min(input.orderIndex, destinationCount),
      );
      const neighbors = await tx.task.findMany({
        where: destinationWhere,
        orderBy: [{ orderKey: 'asc' }, { createdAt: 'asc' }],
        skip: Math.max(targetIndex - 1, 0),
        take: targetIndex === 0 ? 1 : 2,
        select: { orderKey: true },
      });
      let orderKey = orderKeyBetween(
        targetIndex === 0 ? undefined : neighbors[0]?.orderKey,
        targetIndex === 0 ? neighbors[0]?.orderKey : neighbors[1]?.orderKey,
      );

      if (!orderKey) {
        const tasksToRebalance = await tx.task.findMany({
          where: {
            projectId: task.projectId,
            status: input.status,
            deletedAt: null,
            id: { not: task.id },
          },
          orderBy: [{ orderKey: 'asc' }, { createdAt: 'asc' }],
          select: { id: true },
        });
        await Promise.all(
          tasksToRebalance.map(({ id }, index) =>
            tx.task.update({
              where: { id },
              data: { orderKey: orderKeyForIndex(index) },
            }),
          ),
        );
        const destinationTasks = tasksToRebalance.map((_, index) => ({
          orderKey: orderKeyForIndex(index),
        }));
        orderKey = orderKeyBetween(
          destinationTasks[targetIndex - 1]?.orderKey,
          destinationTasks[targetIndex]?.orderKey,
        );
      }

      return tx.task.update({
        where: { id: task.id },
        data: { status: input.status, orderKey: orderKey! },
        include: { assignee: true },
      });
    });
  }

  private async rebalanceColumn(projectId: string, status: string) {
    const tasks = await this.prisma.task.findMany({
      where: { projectId, status, deletedAt: null },
      orderBy: [{ orderKey: 'asc' }, { createdAt: 'asc' }],
      select: { id: true },
    });
    await this.prisma.$transaction(
      tasks.map(({ id }, index) =>
        this.prisma.task.update({
          where: { id },
          data: { orderKey: orderKeyForIndex(index) },
        }),
      ),
    );
  }

  async remove(userId: string, id: string) {
    return this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async projectHasColumn(userId: string, projectId: string, status: string) {
    const column = await this.prisma.projectColumn.findFirst({
      where: {
        projectId,
        key: status,
        project: this.projectAccessibleBy(userId),
      },
      select: { id: true },
    });
    return Boolean(column);
  }

  async projectHasMember(projectId: string, memberId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: memberId } },
      select: { id: true },
    });
    return Boolean(member);
  }
}
