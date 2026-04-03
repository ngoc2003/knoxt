import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateIncomeInput,
  CreateExpenseInput,
  CreateInvoiceInput,
  ListIncomeInput,
  ListInvoiceInput,
  UpdateIncomeInput,
  UpdateExpenseInput,
  UpdateInvoiceInput,
} from './dto/finance.dto';
import { PaginationInput } from '../../common/pagination.dto';
import { Prisma } from 'database/generated/client';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Income ────────────────────────────────────────────────────────────────

  async createIncome(userId: string, data: CreateIncomeInput) {
    return this.prisma.income.create({
      data: {
        userId,
        customerId: data.customerId,
        invoiceId: data.invoiceId,
        amount: data.amount,
        currency: data.currency ?? 'USD',
        status: data.status ?? 'pending',
        note: data.note,
        receivedAt: data.receivedAt,
      },
    });
  }

  async findAllIncome(
    userId: string,
    filter: ListIncomeInput,
    pagination: PaginationInput,
  ) {
    const where: Prisma.IncomeWhereInput = {
      userId,
      ...(filter.customerId && { customerId: filter.customerId }),
      ...(filter.status && { status: filter.status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.income.findMany({
        where,
        skip: pagination.skip ?? 0,
        take: pagination.take ?? 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.income.count({ where }),
    ]);

    return {
      items,
      total,
      skip: pagination.skip ?? 0,
      take: pagination.take ?? 20,
    };
  }

  async findOneIncome(userId: string, id: string) {
    const income = await this.prisma.income.findFirst({
      where: { id, userId },
    });
    if (!income) throw new NotFoundException('Income not found');
    return income;
  }

  async updateIncome(userId: string, id: string, data: UpdateIncomeInput) {
    await this.findOneIncome(userId, id);
    return this.prisma.income.update({ where: { id }, data });
  }

  async removeIncome(userId: string, id: string) {
    await this.findOneIncome(userId, id);
    return this.prisma.income.delete({ where: { id } });
  }

  // ── Expense ───────────────────────────────────────────────────────────────

  async createExpense(userId: string, data: CreateExpenseInput) {
    return this.prisma.expense.create({
      data: {
        userId,
        amount: data.amount,
        currency: data.currency ?? 'USD',
        category: data.category,
        note: data.note,
        date: data.date ?? new Date(),
      },
    });
  }

  async findAllExpenses(userId: string, pagination: PaginationInput) {
    const where: Prisma.ExpenseWhereInput = { userId };

    const [items, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip: pagination.skip ?? 0,
        take: pagination.take ?? 20,
        orderBy: { date: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      items,
      total,
      skip: pagination.skip ?? 0,
      take: pagination.take ?? 20,
    };
  }

  async updateExpense(userId: string, id: string, data: UpdateExpenseInput) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return this.prisma.expense.update({ where: { id }, data });
  }

  async removeExpense(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return this.prisma.expense.delete({ where: { id } });
  }

  // ── Invoice ───────────────────────────────────────────────────────────────

  async createInvoice(userId: string, data: CreateInvoiceInput) {
    const total = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    return this.prisma.invoice.create({
      data: {
        userId,
        customerId: data.customerId,
        notes: data.notes,
        issuedAt: data.issuedAt,
        dueAt: data.dueAt,
        total,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findAllInvoices(
    userId: string,
    filter: ListInvoiceInput,
    pagination: PaginationInput,
  ) {
    const where: Prisma.InvoiceWhereInput = {
      userId,
      ...(filter.customerId && { customerId: filter.customerId }),
      ...(filter.status && { status: filter.status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip: pagination.skip ?? 0,
        take: pagination.take ?? 20,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      items,
      total,
      skip: pagination.skip ?? 0,
      take: pagination.take ?? 20,
    };
  }

  async findOneInvoice(userId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, userId },
      include: { items: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async updateInvoice(userId: string, id: string, data: UpdateInvoiceInput) {
    await this.findOneInvoice(userId, id);
    return this.prisma.invoice.update({
      where: { id },
      data,
      include: { items: true },
    });
  }

  async removeInvoice(userId: string, id: string) {
    await this.findOneInvoice(userId, id);
    return this.prisma.invoice.delete({
      where: { id },
      include: { items: true },
    });
  }
}
