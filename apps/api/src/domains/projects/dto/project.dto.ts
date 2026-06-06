import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateProjectInput {
  @Field()
  @IsString()
  @MaxLength(200)
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsUUID()
  customerId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  budget?: string;

  @Field(() => String)
  @IsString()
  @IsIn(['active', 'completed', 'on-hold'])
  status: string;

  @Field(() => String)
  @IsDateString()
  startDate: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

@InputType()
export class UpdateProjectInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'completed', 'on-hold'])
  status?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

@InputType()
export class CreateProjectColumnInput {
  @Field()
  @IsUUID()
  projectId: string;

  @Field()
  @IsString()
  @MaxLength(100)
  name: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  orderIndex?: number;
}
