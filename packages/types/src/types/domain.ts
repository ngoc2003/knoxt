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

export enum InvoiceStatus {
  draft = "draft",
  sent = "sent",
  paid = "paid",
  overdue = "overdue",
}

export enum IncomeStatus {
  pending = "pending",
  received = "received",
}

export enum NotificationType {
  welcome = "welcome",
  projectMemberAdded = "project-member-added",
  projectDeleted = "project-deleted",
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
  projectId: string;
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
  projectId: string;
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
  status: string;
  customerId: string;
  startDate: Date;
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
  customerId: string;
  budget?: string;
  status: string;
  startDate: string;
  endDate?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: string;
  startDate?: string;
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
  title: string;
  content: string;
  customerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteInput {
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
  search?: string;
  customerId?: string;
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export interface Income {
  id: string;
  amount: number;
  currency: string;
  status: IncomeStatus;
  customerId: string;
  invoiceId?: string | null;
  note?: string | null;
  receivedAt?: Date | null;
  projectId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category?: string | null;
  note?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  total: number;
  status: InvoiceStatus;
  notes?: string | null;
  issuedAt?: Date | null;
  dueAt?: Date | null;
  paidAt?: Date | null;
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}
