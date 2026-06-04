import { Injectable } from '@nestjs/common';
import { Prisma } from 'database/generated/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { PaginationInput } from '../../../core/common/dtos/pagination.dto';
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from '../dto/project.dto';
import type {
  IProjectRepository,
  ProjectWithRelations,
} from '../application/ports/project.repository';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

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
      userId,
      deletedAt: null,
      ...(customerId && { customerId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: pagination.skip ?? 0,
        take: pagination.take ?? 20,
        orderBy: { createdAt: 'desc' },
        include: { customer: true, incomes: true },
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
      where: { id, userId, deletedAt: null },
      include: {
        customer: true,
        tasks: {
          where: { deletedAt: null },
          orderBy: { orderIndex: 'asc' },
          include: { tags: { include: { tag: true } } },
        },
        incomes: true,
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
}
