import type {
  Project,
  ProjectColumn,
  ProjectMember,
  ProjectInvitation,
  User,
  Customer,
  Income,
  Task,
} from 'database/generated/client';
import type {
  PaginationInput,
  PageResult,
} from '../../../../core/common/dtos/pagination.dto';
import type {
  CreateProjectInput,
  DeleteProjectColumnInput,
  CreateProjectColumnInput,
  AddProjectMemberInput,
  CancelProjectInvitationInput,
  RemoveProjectMemberInput,
  ReorderProjectColumnsInput,
  UpdateProjectMemberRoleInput,
  UpdateProjectInput,
} from '../../dto/project.dto';

export type ProjectWithRelations = Project & {
  user: User;
  customer: Customer;
  incomes: Income[];
  tasks: Task[];
  columns: ProjectColumn[];
  members: (ProjectMember & { user: User })[];
  invitations: ProjectInvitation[];
};

export interface IProjectRepository {
  create(
    userId: string,
    data: Omit<CreateProjectInput, 'budget'>,
  ): Promise<Project>;
  findAll(
    userId: string,
    pagination: PaginationInput,
    customerId?: string,
  ): Promise<PageResult<ProjectWithRelations>>;
  findOne(userId: string, id: string): Promise<ProjectWithRelations | null>;
  update(
    userId: string,
    id: string,
    data: UpdateProjectInput,
  ): Promise<Project>;
  remove(userId: string, id: string): Promise<Project>;
  createColumn(
    userId: string,
    data: CreateProjectColumnInput,
  ): Promise<ProjectColumn | null>;
  reorderColumns(data: ReorderProjectColumnsInput): Promise<ProjectColumn[]>;
  deleteColumn(data: DeleteProjectColumnInput): Promise<ProjectColumn | null>;
  addMember(
    data: AddProjectMemberInput,
  ): Promise<(ProjectMember & { user: User }) | null>;
  updateMemberRole(
    data: UpdateProjectMemberRoleInput,
  ): Promise<(ProjectMember & { user: User }) | null>;
  removeMember(
    data: RemoveProjectMemberInput,
  ): Promise<(ProjectMember & { user: User }) | null>;
  findUserByEmail(email: string): Promise<User | null>;
  createInvitation(
    invitedById: string,
    data: AddProjectMemberInput,
  ): Promise<ProjectInvitation>;
  cancelInvitation(
    data: CancelProjectInvitationInput,
  ): Promise<ProjectInvitation | null>;
}
