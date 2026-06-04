import type { Project, Customer, Income } from 'database/generated/client';
import type {
  PaginationInput,
  PageResult,
} from '../../../../core/common/dtos/pagination.dto';
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from '../../dto/project.dto';

export type ProjectWithRelations = Project & {
  customer: Customer;
  incomes: Income[];
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
}
