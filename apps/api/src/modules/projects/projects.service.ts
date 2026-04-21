import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProjectInput, UpdateProjectInput } from './dto/project.dto';
import { PaginationInput } from '../../common/pagination.dto';
import { Prisma } from 'database/generated/client';
import { FinanceService } from '../finance/finance.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financeService: FinanceService,
  ) {}

  private toProjectCreateData(userId: string, data: CreateProjectInput) {
    const { endDate, startDate, ...rest } = data;

    return {
      ...rest,
      userId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    };
  }

  private toProjectUpdateData(data: UpdateProjectInput) {
    return {
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
    };
  }

  async create(userId: string, data: CreateProjectInput) {
    const { budget, ...projectData } = data;
    const project = await this.prisma.project.create({
      data: this.toProjectCreateData(userId, { ...projectData }),
    });

    // If budget is provided, create an income record
    if (budget && !isNaN(Number(budget))) {
      await this.financeService.createIncome(userId, {
        amount: Number(budget),
        customerId: data.customerId,
        currency: 'USD',
        projectId: project.id,
        note: `Initial project budget for ${project.name}`,
      });
    }

    return project;
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
    console.log(
      'ProjectsService.findAll - where:',
      where,
      'items found:',
      items.length,
    );

    return {
      items,
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
    if (!project) throw new NotFoundException('Project not found');
    return {
      ...project,
      tasks: project.tasks.map((task) => ({
        ...task,
        tags: task.tags.map((t) => t.tag),
      })),
    };
  }

  async update(userId: string, id: string, data: UpdateProjectInput) {
    await this.findOne(userId, id);
    return this.prisma.project.update({
      where: { id },
      data: this.toProjectUpdateData(data),
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
