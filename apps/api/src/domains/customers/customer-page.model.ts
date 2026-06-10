import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Customer } from './customer.model';

@ObjectType()
export class CustomerPageItem extends Customer {}

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
