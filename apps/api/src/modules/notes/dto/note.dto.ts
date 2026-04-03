import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class CreateNoteInput {
  @Field()
  @IsString()
  @MaxLength(500)
  title: string;

  @Field()
  @IsString()
  content: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  customerId?: string;
}

@InputType()
export class UpdateNoteInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  content?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  customerId?: string;
}

@InputType()
export class ListNotesInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  customerId?: string;
}
