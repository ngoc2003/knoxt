import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './customer.model';
import { CustomerPage } from './customer-page.model';
import {
  CreateCustomerInput,
  ListCustomersInput,
  UpdateCustomerInput,
} from './dto/customer.dto';
import { GqlAuthGuard } from '../../core/common/guards/gql-auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../../core/common/decorators/current-user.decorator';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';

@Resolver(() => Customer)
@UseGuards(GqlAuthGuard)
export class CustomersResolver {
  constructor(private readonly customersService: CustomersService) {}

  @Query(() => CustomerPage)
  listCustomers(
    @CurrentUser() user: AuthUser,
    @Args('filter', { nullable: true }) filter?: ListCustomersInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.customersService.findAll(
      user.id,
      filter ?? {},
      pagination ?? {},
    );
  }

  @Query(() => Customer)
  customerDetail(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.customersService.findOne(user.id, id);
  }

  @Mutation(() => Customer)
  createCustomer(
    @CurrentUser() user: AuthUser,
    @Args('data') data: CreateCustomerInput,
  ) {
    return this.customersService.create(user.id, data);
  }

  @Mutation(() => Customer)
  updateCustomer(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('data') data: UpdateCustomerInput,
  ) {
    return this.customersService.update(user.id, id, data);
  }

  @Mutation(() => Customer)
  deleteCustomer(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.customersService.remove(user.id, id);
  }
}
