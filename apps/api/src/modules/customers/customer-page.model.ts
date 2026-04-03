import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Customer } from './customer.model';

@ObjectType()
export class CustomerPage {
  @Field(() => [Customer])
  items: Customer[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}
