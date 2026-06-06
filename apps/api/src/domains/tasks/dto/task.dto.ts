import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Priority } from '../../../core/common/enum/enums';

@InputType()
export class CreateTaskInput {
  @Field()
  @IsString()
  @MaxLength(500)
  title: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsUUID()
  projectId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  status?: string;

  @Field(() => Priority, { nullable: true })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  orderIndex?: number;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  dueDate?: Date;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  assigneeId?: string | null;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

@InputType()
export class UpdateTaskInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  status?: string;

  @Field(() => Priority, { nullable: true })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  orderIndex?: number;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  dueDate?: Date;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  assigneeId?: string | null;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

@InputType()
export class MoveTaskInput {
  @Field()
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  status: string;

  @Field(() => Int)
  @IsInt()
  orderIndex: number;
}

@InputType()
export class ListTasksInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  projectId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  status?: string;

  @Field(() => Priority, { nullable: true })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
