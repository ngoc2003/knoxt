import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProjectInput, UpdateProjectInput } from './dto/project.dto';
import { PaginationInput } from '../../common/pagination.dto';
import { Prisma } from 'database/generated/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateProjectInput) {
    return this.prisma.project.create({
      data: { ...data, userId },
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
        include: { customer: true },
      }),
      this.prisma.project.count({ where }),
    ]);

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
