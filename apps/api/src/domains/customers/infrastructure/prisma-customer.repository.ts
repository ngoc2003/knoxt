import { Injectable } from '@nestjs/common';
import { Prisma } from 'database/generated/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { PaginationInput } from '../../../core/common/dtos/pagination.dto';
import type {
  CreateCustomerInput,
  ListCustomersInput,
  UpdateCustomerInput,
} from '../dto/customer.dto';
import type {
  ICustomerRepository,
  CustomerWithRelations,
} from '../application/ports/customer.repository';

@Injectable()
export class PrismaCustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateCustomerInput) {
    return this.prisma.customer.create({
      data: { ...data, userId },
    });
  }

  async findAll(
    userId: string,
    filter: ListCustomersInput,
    pagination: PaginationInput,
  ) {
    const where: Prisma.CustomerWhereInput = {
      userId,
      deletedAt: null,
      ...(filter.status && { status: filter.status }),
      ...(filter.search && {
        OR: [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { email: { contains: filter.search, mode: 'insensitive' } },
          { company: { contains: filter.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          projects: { where: { deletedAt: null } },
          incomes: true,
        },
        skip: pagination.skip ?? 0,
        take: pagination.take ?? 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items: items as CustomerWithRelations[],
      total,
      skip: pagination.skip ?? 0,
      take: pagination.take ?? 20,
    };
  }

  async findOne(userId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        projects: { where: { deletedAt: null } },
        incomes: true,
      },
    });
    return customer as CustomerWithRelations | null;
  }

  async update(userId: string, id: string, data: UpdateCustomerInput) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
