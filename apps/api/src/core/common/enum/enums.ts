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

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

export enum ProjectRole {
  viewer = 'viewer',
  editor = 'editor',
  admin = 'admin',
}

export enum ProjectStatus {
  active = 'active',
  on_hold = 'on_hold',
  completed = 'completed',
  archived = 'archived',
}

export enum NotePermission {
  viewer = 'viewer',
  editor = 'editor',
}

export enum DecisionStatus {
  proposed = 'proposed',
  accepted = 'accepted',
  superseded = 'superseded',
  rejected = 'rejected',
}

export enum MeetingStatus {
  scheduled = 'scheduled',
  completed = 'completed',
  cancelled = 'cancelled',
}

export enum ActionItemStatus {
  open = 'open',
  completed = 'completed',
  cancelled = 'cancelled',
}

export enum RequirementPriority {
  low = 'low',
  medium = 'medium',
  high = 'high',
  critical = 'critical',
}

export enum RequirementStatus {
  draft = 'draft',
  approved = 'approved',
  implemented = 'implemented',
  rejected = 'rejected',
}

export enum ProjectKnowledgeType {
  note = 'note',
  decision = 'decision',
  meeting = 'meeting',
  requirement = 'requirement',
}

export enum Permission {
  projectRead = 'project.read',
  projectEdit = 'project.edit',
  projectManageMembers = 'project.manage-members',
  projectDelete = 'project.delete',
  projectViewAudit = 'project.view-audit',
}

export enum NotificationType {
  welcome = 'welcome',
  projectMemberAdded = 'project-member-added',
  projectDeleted = 'project-deleted',
  projectAccessRequest = 'project-access-request',
}

registerEnumType(Priority, { name: 'Priority' });
registerEnumType(CustomerStatus, { name: 'CustomerStatus' });
registerEnumType(SortOrder, { name: 'SortOrder' });
registerEnumType(ProjectRole, { name: 'ProjectRole' });
registerEnumType(ProjectStatus, { name: 'ProjectStatus' });
registerEnumType(NotePermission, { name: 'NotePermission' });
registerEnumType(DecisionStatus, { name: 'DecisionStatus' });
registerEnumType(MeetingStatus, { name: 'MeetingStatus' });
registerEnumType(ActionItemStatus, { name: 'ActionItemStatus' });
registerEnumType(RequirementPriority, { name: 'RequirementPriority' });
registerEnumType(RequirementStatus, { name: 'RequirementStatus' });
registerEnumType(ProjectKnowledgeType, { name: 'ProjectKnowledgeType' });
registerEnumType(NotificationType, { name: 'NotificationType' });
