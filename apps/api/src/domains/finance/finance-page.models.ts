import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Income, Expense, Invoice } from './models/finance.models';

@ObjectType()
export class IncomePage {
  @Field(() => [Income])
  items: Income[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
export class ExpensePage {
  @Field(() => [Expense])
  items: Expense[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
export class InvoicePage {
  @Field(() => [Invoice])
  items: Invoice[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}
