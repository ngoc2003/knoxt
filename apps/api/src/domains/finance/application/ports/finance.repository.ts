import type {
  Income,
  Expense,
  Invoice,
  InvoiceItem,
} from 'database/generated/client';
import type {
  PaginationInput,
  PageResult,
} from '../../../../core/common/dtos/pagination.dto';
import type {
  CreateIncomeInput,
  CreateExpenseInput,
  CreateInvoiceInput,
  ListIncomeInput,
  ListInvoiceInput,
  UpdateIncomeInput,
  UpdateExpenseInput,
  UpdateInvoiceInput,
} from '../../dto/finance.dto';

export type InvoiceWithItems = Invoice & { items: InvoiceItem[] };

export interface IFinanceRepository {
  // ── Income ──────────────────────────────────────────────────────────────
  createIncome(userId: string, data: CreateIncomeInput): Promise<Income>;
  findAllIncome(
    userId: string,
    filter: ListIncomeInput,
    pagination: PaginationInput,
  ): Promise<PageResult<Income>>;
  findOneIncome(userId: string, id: string): Promise<Income | null>;
  updateIncome(
    userId: string,
    id: string,
    data: UpdateIncomeInput,
  ): Promise<Income>;
  removeIncome(userId: string, id: string): Promise<Income>;

  // ── Expense ─────────────────────────────────────────────────────────────
  createExpense(userId: string, data: CreateExpenseInput): Promise<Expense>;
  findAllExpenses(
    userId: string,
    pagination: PaginationInput,
  ): Promise<PageResult<Expense>>;
  updateExpense(
    userId: string,
    id: string,
    data: UpdateExpenseInput,
  ): Promise<Expense>;
  removeExpense(userId: string, id: string): Promise<Expense>;

  // ── Invoice ─────────────────────────────────────────────────────────────
  createInvoice(
    userId: string,
    data: CreateInvoiceInput,
  ): Promise<InvoiceWithItems>;
  findAllInvoices(
    userId: string,
    filter: ListInvoiceInput,
    pagination: PaginationInput,
  ): Promise<PageResult<InvoiceWithItems>>;
  findOneInvoice(userId: string, id: string): Promise<InvoiceWithItems | null>;
  updateInvoice(
    userId: string,
    id: string,
    data: UpdateInvoiceInput,
  ): Promise<InvoiceWithItems>;
  removeInvoice(userId: string, id: string): Promise<InvoiceWithItems>;
}
