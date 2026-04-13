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

  async create(userId: string, data: CreateProjectInput & { budget?: string }) {
    const { budget, ...projectData } = data;
    const project = await this.prisma.project.create({
      data: { ...projectData, userId },
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
        tasks: { where: { deletedAt: null }, orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(userId: string, id: string, data: UpdateProjectInput) {
    await this.findOne(userId, id);
    return this.prisma.project.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
