import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateCustomerInput,
  ListCustomersInput,
  UpdateCustomerInput,
} from './dto/customer.dto';
import { PaginationInput } from '../../common/pagination.dto';
import { Prisma } from 'database/generated/client';

@Injectable()
export class CustomersService {
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

    console.log(items);
    return {
      items,
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
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(userId: string, id: string, data: UpdateCustomerInput) {
    await this.findOne(userId, id);
    return this.prisma.customer.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
