import {
  Field,
  Float,
  GraphQLISODateTime,
  InputType,
  Int,
} from '@nestjs/graphql';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IncomeStatus, InvoiceStatus } from '../../../core/common/enum/enums';

// ─── Income DTOs ─────────────────────────────────────────────────────────────

@InputType()
export class CreateIncomeInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  currency?: string;

  @Field()
  @IsUUID()
  customerId: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  invoiceId?: string;

  @Field(() => IncomeStatus, { nullable: true })
  @IsEnum(IncomeStatus)
  @IsOptional()
  status?: IncomeStatus;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  note?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  receivedAt?: Date;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  projectId?: string;
}

@InputType()
export class UpdateIncomeInput {
  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @Field(() => IncomeStatus, { nullable: true })
  @IsEnum(IncomeStatus)
  @IsOptional()
  status?: IncomeStatus;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  note?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  receivedAt?: Date;
}

@InputType()
export class ListIncomeInput {
  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @Field(() => IncomeStatus, { nullable: true })
  @IsEnum(IncomeStatus)
  @IsOptional()
  status?: IncomeStatus;
}

// ─── Expense DTOs ─────────────────────────────────────────────────────────────

@InputType()
export class CreateExpenseInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  currency?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  category?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  note?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  date?: Date;
}

@InputType()
export class UpdateExpenseInput {
  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  category?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  note?: string;
}

// ─── Invoice DTOs ─────────────────────────────────────────────────────────────

@InputType()
export class InvoiceItemInput {
  @Field()
  @IsString()
  description: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

@InputType()
export class CreateInvoiceInput {
  @Field()
  @IsUUID()
  customerId: string;

  @Field(() => [InvoiceItemInput])
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemInput)
  items: InvoiceItemInput[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  issuedAt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  dueAt?: Date;
}

@InputType()
export class UpdateInvoiceInput {
  @Field(() => InvoiceStatus, { nullable: true })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  dueAt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  paidAt?: Date;
}

@InputType()
export class ListInvoiceInput {
  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @Field(() => InvoiceStatus, { nullable: true })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;
}
