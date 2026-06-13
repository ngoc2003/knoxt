import { Field, InputType, Int } from '@nestjs/graphql';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

@InputType()
export class CreateNoteInput {
  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  projectId?: string | null;

  @Field()
  @IsString()
  @MaxLength(500)
  title: string;

  @Field(() => String, { nullable: true, defaultValue: '' })
  @IsString()
  @IsOptional()
  content?: string = '';

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  parentId?: string | null;
}

@InputType()
export class UpdateNoteInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  content?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  customerId?: string | null;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  expectedVersion: number;
}

@InputType()
export class AssignNoteProjectInput {
  @Field()
  @IsUUID()
  noteId: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  projectId?: string | null;
}

@InputType()
export class ListNotesInput {
  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  standaloneOnly?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  customerId?: string;
}

@InputType()
export class MoveNoteInput {
  @Field()
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  parentId?: string | null;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  orderedSiblingIds: string[];
}
