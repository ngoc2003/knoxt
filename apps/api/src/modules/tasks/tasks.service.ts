import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateTaskInput,
  ListTasksInput,
  MoveTaskInput,
  UpdateTaskInput,
} from './dto/task.dto';
import { PaginationInput } from '../../common/pagination.dto';
import { Prisma } from 'database/generated/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateTaskInput) {
    const lastTask = await this.prisma.task.findFirst({
      where: { projectId: data.projectId, userId, deletedAt: null },
      orderBy: { orderIndex: 'desc' },
    });
    const orderIndex =
      data.orderIndex ?? (lastTask ? lastTask.orderIndex + 1 : 0);

    return this.prisma.task.create({
      data: {
        ...data,
        userId,
        orderIndex,
        status: data.status ?? 'todo',
        priority: data.priority ?? 'medium',
      },
    });
  }

  async findAll(
    userId: string,
    filter: ListTasksInput,
    pagination: PaginationInput,
  ) {
    const where: Prisma.TaskWhereInput = {
      userId,
      deletedAt: null,
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
        orderBy: [{ status: 'asc' }, { orderIndex: 'asc' }],
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      items,
      total,
      skip: pagination.skip ?? 0,
      take: pagination.take ?? 20,
    };
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!task) throw new NotFoundException('Task not found' + id);
    return task;
  }

  async update(userId: string, id: string, data: UpdateTaskInput) {
    await this.findOne(userId, id);
    return this.prisma.task.update({ where: { id }, data });
  }

  async moveTask(userId: string, input: MoveTaskInput) {
    await this.findOne(userId, input.id);
    return this.prisma.task.update({
      where: { id: input.id },
      data: { status: input.status, orderIndex: input.orderIndex },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
