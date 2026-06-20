import type { User } from "./auth";

// ─── Common ───────────────────────────────────────────────────────────────────

export interface PaginationInput {
  skip?: number;
  take?: number;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  skip: number;
  take: number;
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum Priority {
  low = "low",
  medium = "medium",
  high = "high",
}

export enum CustomerStatus {
  active = "active",
  inactive = "inactive",
}

export enum NotificationType {
  welcome = "welcome",
  projectMemberAdded = "project-member-added",
  projectDeleted = "project-deleted",
  projectAccessRequest = "project-access-request",
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string | Date;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface Tag {
  id: string;
  name: string;
  color?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: Priority;
  orderIndex: number;
  projectId?: string | null;
  assigneeId?: string | null;
  assignee?: User | null;
  dueDate?: Date | null;
  tags?: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId?: string | null;
  status?: string;
  priority?: Priority;
  orderIndex?: number;
  dueDate?: Date;
  assigneeId?: string | null;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: Priority;
  orderIndex?: number;
  dueDate?: Date;
  assigneeId?: string | null;
  tags?: string[];
}

export interface MoveTaskInput {
  id: string;
  status: string;
  orderIndex: number;
}

export interface ListTasksInput {
  projectId?: string;
  status?: string;
  priority?: Priority;
  search?: string;
  tags?: string[];
}

// ─── Project ─────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  customerId?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  columns?: ProjectColumn[];
  members?: ProjectMember[];
  invitations?: ProjectInvitation[];
}

export enum ProjectRole {
  viewer = "viewer",
  editor = "editor",
  admin = "admin",
}

export enum ProjectStatus {
  active = "active",
  on_hold = "on_hold",
  completed = "completed",
  archived = "archived",
}

export interface ProjectMember {
  id: string;
  userId: string;
  role: ProjectRole;
  user: User;
}

export interface ProjectInvitation {
  id: string;
  email: string;
  role: ProjectRole;
}

export interface ProjectColumn {
  id: string;
  key: string;
  name: string;
  orderIndex: number;
}

export interface ReorderProjectColumnsInput {
  projectId: string;
  columnIds: string[];
}

export interface DeleteProjectColumnInput {
  projectId: string;
  columnId: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  customerId?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  customerId?: string | null;
  startDate?: string | null;
  endDate?: string;
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: CustomerStatus;
}

export interface ListCustomersInput {
  search?: string;
  status?: CustomerStatus;
}

// ─── Note ────────────────────────────────────────────────────────────────────

export interface Note {
  id: string;
  projectId: string;
  title: string;
  content: string;
  customerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteInput {
  projectId: string;
  title: string;
  content: string;
  customerId?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  customerId?: string;
}

export interface ListNotesInput {
  projectId?: string;
  search?: string;
  customerId?: string;
}
