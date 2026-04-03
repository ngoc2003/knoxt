import {
  Field,
  Float,
  GraphQLISODateTime,
  ID,
  ObjectType,
} from '@nestjs/graphql';
import { IncomeStatus, InvoiceStatus } from '../../../common/enums';

@ObjectType()
export class Income {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  amount: number;

  @Field()
  currency: string;

  @Field(() => IncomeStatus)
  status: IncomeStatus;

  @Field(() => String, { nullable: true })
  note?: string | null;

  @Field(() => ID)
  customerId: string;

  @Field(() => ID, { nullable: true })
  invoiceId?: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  receivedAt?: Date | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

@ObjectType()
export class Expense {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  amount: number;

  @Field()
  currency: string;

  @Field(() => String, { nullable: true })
  category?: string | null;

  @Field(() => String, { nullable: true })
  note?: string | null;

  @Field(() => GraphQLISODateTime)
  date: Date;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

@ObjectType()
export class InvoiceItem {
  @Field(() => ID)
  id: string;

  @Field()
  description: string;

  @Field(() => Float)
  quantity: number;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  total: number;
}

@ObjectType()
export class Invoice {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  customerId: string;

  @Field(() => InvoiceStatus)
  status: InvoiceStatus;

  @Field(() => Float)
  total: number;

  @Field(() => String, { nullable: true })
  notes?: string | null;

  @Field(() => [InvoiceItem])
  items: InvoiceItem[];

  @Field(() => GraphQLISODateTime, { nullable: true })
  issuedAt?: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  dueAt?: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  paidAt?: Date | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
