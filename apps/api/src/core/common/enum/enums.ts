import { registerEnumType } from '@nestjs/graphql';

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

export enum ProjectRole {
  viewer = 'viewer',
  editor = 'editor',
  admin = 'admin',
}

export enum Permission {
  projectRead = 'project.read',
  projectEdit = 'project.edit',
  projectManageMembers = 'project.manage-members',
  projectDelete = 'project.delete',
}

export enum NotificationType {
  welcome = 'welcome',
  projectMemberAdded = 'project-member-added',
  projectDeleted = 'project-deleted',
}

registerEnumType(Priority, { name: 'Priority' });
registerEnumType(CustomerStatus, { name: 'CustomerStatus' });
registerEnumType(InvoiceStatus, { name: 'InvoiceStatus' });
registerEnumType(IncomeStatus, { name: 'IncomeStatus' });
registerEnumType(SortOrder, { name: 'SortOrder' });
registerEnumType(ProjectRole, { name: 'ProjectRole' });
registerEnumType(NotificationType, { name: 'NotificationType' });
