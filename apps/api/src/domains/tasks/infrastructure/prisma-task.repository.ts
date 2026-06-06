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
      where: { projectId: data.projectId, deletedAt: null },
      orderBy: { orderIndex: 'desc' },
    });
    const orderIndex =
      rest.orderIndex ?? (lastTask ? lastTask.orderIndex + 1 : 0);

    const tagIds = tags ? await this.resolveTagIds(userId, tags) : [];

    return this.prisma.task.create({
      data: {
        ...rest,
        userId,
        orderIndex,
        status: rest.status ?? 'todo',
        priority: rest.priority ?? 'medium',
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
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
        include: { tags: { include: { tag: true } } },
        orderBy: [{ status: 'asc' }, { orderIndex: 'asc' }],
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
    });
  }

  async update(userId: string, id: string, data: UpdateTaskInput) {
    const { tags, ...rest } = data;
    const updateData: Prisma.TaskUpdateInput = { ...rest };

    if (tags !== undefined) {
      const tagIds = await this.resolveTagIds(userId, tags);
      updateData.tags = {
        deleteMany: {},
        create: tagIds.map((tagId) => ({ tagId })),
      };
    }

    return this.prisma.task.update({ where: { id }, data: updateData });
  }

  async moveTask(userId: string, input: MoveTaskInput) {
    return this.prisma.task.update({
      where: { id: input.id },
      data: { status: input.status, orderIndex: input.orderIndex },
    });
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
}
