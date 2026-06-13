import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class SearchNotesInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  query?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  standaloneOnly?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
