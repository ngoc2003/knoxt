import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Customer } from './customer.model';
import { Income } from '../finance/models/finance.models';

@ObjectType()
export class CustomerPageItem extends Customer {
  @Field(() => [Income])
  incomes: Income[];
}

@ObjectType()
export class CustomerPage {
  @Field(() => [CustomerPageItem])
  items: CustomerPageItem[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}
