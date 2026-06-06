import type { Customer, Project, Income } from 'database/generated/client';
import type {
  PaginationInput,
  PageResult,
} from '../../../../core/common/dtos/pagination.dto';
import type {
  CreateCustomerInput,
  ListCustomersInput,
  UpdateCustomerInput,
} from '../../dto/customer.dto';

export type CustomerWithRelations = Customer & {
  projects: Project[];
  incomes: Income[];
};

export interface ICustomerRepository {
  create(userId: string, data: CreateCustomerInput): Promise<Customer>;
  findAll(
    userId: string,
    filter: ListCustomersInput,
    pagination: PaginationInput,
  ): Promise<PageResult<CustomerWithRelations>>;
  findOne(userId: string, id: string): Promise<CustomerWithRelations | null>;
  update(
    userId: string,
    id: string,
    data: UpdateCustomerInput,
  ): Promise<Customer>;
  remove(userId: string, id: string): Promise<Customer>;
}
