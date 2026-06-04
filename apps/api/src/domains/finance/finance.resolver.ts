import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { Income, Expense, Invoice } from './models/finance.models';
import { IncomePage, ExpensePage, InvoicePage } from './finance-page.models';
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
import { GqlAuthGuard } from '../../core/common/guards/gql-auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../../core/common/decorators/current-user.decorator';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';

@Resolver()
@UseGuards(GqlAuthGuard)
export class FinanceResolver {
  constructor(private readonly financeService: FinanceService) {}

  // ── Income ────────────────────────────────────────────────────────────────

  @Query(() => IncomePage)
  incomes(
    @CurrentUser() user: AuthUser,
    @Args('filter', { nullable: true }) filter?: ListIncomeInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.financeService.findAllIncome(
      user.id,
      filter ?? {},
      pagination ?? {},
    );
  }

  @Query(() => Income)
  incomeDetail(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.financeService.findOneIncome(user.id, id);
  }

  @Mutation(() => Income)
  createIncome(
    @CurrentUser() user: AuthUser,
    @Args('data') data: CreateIncomeInput,
  ) {
    return this.financeService.createIncome(user.id, data);
  }

  @Mutation(() => Income)
  updateIncome(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('data') data: UpdateIncomeInput,
  ) {
    return this.financeService.updateIncome(user.id, id, data);
  }

  @Mutation(() => Income)
  deleteIncome(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.financeService.removeIncome(user.id, id);
  }

  // ── Expense ───────────────────────────────────────────────────────────────

  @Query(() => ExpensePage)
  expenses(
    @CurrentUser() user: AuthUser,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.financeService.findAllExpenses(user.id, pagination ?? {});
  }

  @Mutation(() => Expense)
  createExpense(
    @CurrentUser() user: AuthUser,
    @Args('data') data: CreateExpenseInput,
  ) {
    return this.financeService.createExpense(user.id, data);
  }

  @Mutation(() => Expense)
  updateExpense(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('data') data: UpdateExpenseInput,
  ) {
    return this.financeService.updateExpense(user.id, id, data);
  }

  @Mutation(() => Expense)
  deleteExpense(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.financeService.removeExpense(user.id, id);
  }

  // ── Invoice ───────────────────────────────────────────────────────────────

  @Query(() => InvoicePage)
  invoices(
    @CurrentUser() user: AuthUser,
    @Args('filter', { nullable: true }) filter?: ListInvoiceInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.financeService.findAllInvoices(
      user.id,
      filter ?? {},
      pagination ?? {},
    );
  }

  @Query(() => Invoice)
  invoiceDetail(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.financeService.findOneInvoice(user.id, id);
  }

  @Mutation(() => Invoice)
  createInvoice(
    @CurrentUser() user: AuthUser,
    @Args('data') data: CreateInvoiceInput,
  ) {
    return this.financeService.createInvoice(user.id, data);
  }

  @Mutation(() => Invoice)
  updateInvoice(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('data') data: UpdateInvoiceInput,
  ) {
    return this.financeService.updateInvoice(user.id, id, data);
  }

  @Mutation(() => Invoice)
  deleteInvoice(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.financeService.removeInvoice(user.id, id);
  }
}
