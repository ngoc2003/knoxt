import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CUSTOMER_REPOSITORY } from '../../core/constants/repository.tokens';
import type { ICustomerRepository } from './application/ports/customer.repository';
import {
  CreateCustomerInput,
  ListCustomersInput,
  UpdateCustomerInput,
} from './dto/customer.dto';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';

@Injectable()
export class CustomersService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async create(userId: string, data: CreateCustomerInput) {
    return this.customerRepo.create(userId, data);
  }

  async findAll(
    userId: string,
    filter: ListCustomersInput,
    pagination: PaginationInput,
  ) {
    return this.customerRepo.findAll(userId, filter, pagination);
  }

  async findOne(userId: string, id: string) {
    const customer = await this.customerRepo.findOne(userId, id);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(userId: string, id: string, data: UpdateCustomerInput) {
    await this.findOne(userId, id);
    return this.customerRepo.update(userId, id, data);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.customerRepo.remove(userId, id);
  }
}
