import { registerEnumType } from '@nestjs/graphql';

export enum TaskStatus {
  todo = 'todo',
  doing = 'doing',
  done = 'done',
}

export enum Priority {
  low = 'low',
  medium = 'medium',
  high = 'high',
}

export enum CustomerStatus {
  active = 'active',
  inactive = 'inactive',
}

export enum InvoiceStatus {
  draft = 'draft',
  sent = 'sent',
  paid = 'paid',
  overdue = 'overdue',
}

export enum IncomeStatus {
  pending = 'pending',
  received = 'received',
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

registerEnumType(TaskStatus, { name: 'TaskStatus' });
registerEnumType(Priority, { name: 'Priority' });
registerEnumType(CustomerStatus, { name: 'CustomerStatus' });
registerEnumType(InvoiceStatus, { name: 'InvoiceStatus' });
registerEnumType(IncomeStatus, { name: 'IncomeStatus' });
registerEnumType(SortOrder, { name: 'SortOrder' });
