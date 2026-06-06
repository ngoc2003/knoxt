import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { FINANCE_REPOSITORY } from '../../core/constants/repository.tokens';
import type { IFinanceRepository } from './application/ports/finance.repository';
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
import { PaginationInput } from '../../core/common/dtos/pagination.dto';

@Injectable()
export class FinanceService {
  constructor(
    @Inject(FINANCE_REPOSITORY)
    private readonly financeRepo: IFinanceRepository,
  ) {}

  // ── Income ────────────────────────────────────────────────────────────────

  async createIncome(userId: string, data: CreateIncomeInput) {
    return this.financeRepo.createIncome(userId, data);
  }

  async findAllIncome(userId: string, filter: ListIncomeInput, pagination: PaginationInput) {
    return this.financeRepo.findAllIncome(userId, filter, pagination);
  }

  async findOneIncome(userId: string, id: string) {
    const income = await this.financeRepo.findOneIncome(userId, id);
    if (!income) throw new NotFoundException('Income not found');
    return income;
  }

  async updateIncome(userId: string, id: string, data: UpdateIncomeInput) {
    await this.findOneIncome(userId, id);
    return this.financeRepo.updateIncome(userId, id, data);
  }

  async removeIncome(userId: string, id: string) {
    await this.findOneIncome(userId, id);
    return this.financeRepo.removeIncome(userId, id);
  }

  // ── Expense ───────────────────────────────────────────────────────────────

  async createExpense(userId: string, data: CreateExpenseInput) {
    return this.financeRepo.createExpense(userId, data);
  }

  async findAllExpenses(userId: string, pagination: PaginationInput) {
    return this.financeRepo.findAllExpenses(userId, pagination);
  }

  async updateExpense(userId: string, id: string, data: UpdateExpenseInput) {
    return this.financeRepo.updateExpense(userId, id, data);
  }

  async removeExpense(userId: string, id: string) {
    return this.financeRepo.removeExpense(userId, id);
  }

  // ── Invoice ───────────────────────────────────────────────────────────────

  async createInvoice(userId: string, data: CreateInvoiceInput) {
    return this.financeRepo.createInvoice(userId, data);
  }

  async findAllInvoices(userId: string, filter: ListInvoiceInput, pagination: PaginationInput) {
    return this.financeRepo.findAllInvoices(userId, filter, pagination);
  }

  async findOneInvoice(userId: string, id: string) {
    const invoice = await this.financeRepo.findOneInvoice(userId, id);
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async updateInvoice(userId: string, id: string, data: UpdateInvoiceInput) {
    await this.findOneInvoice(userId, id);
    return this.financeRepo.updateInvoice(userId, id, data);
  }

  async removeInvoice(userId: string, id: string) {
    await this.findOneInvoice(userId, id);
    return this.financeRepo.removeInvoice(userId, id);
  }
}
