import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Priority, TaskStatus } from '../../../common/enums';

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

  @Field(() => TaskStatus, { nullable: true })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

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

  @Field(() => TaskStatus, { nullable: true })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

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
}

@InputType()
export class MoveTaskInput {
  @Field()
  @IsUUID()
  id: string;

  @Field(() => TaskStatus)
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @Field(() => Int)
  @IsInt()
  orderIndex: number;
}

@InputType()
export class ListTasksInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  projectId?: string;

  @Field(() => TaskStatus, { nullable: true })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @Field(() => Priority, { nullable: true })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  search?: string;
}
