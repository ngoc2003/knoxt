import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  IsInt,
} from 'class-validator';
import { NotePermission } from '../../../core/common/enum/enums';

@InputType()
export class CreateNotePublicLinkInput {
  @Field()
  @IsUUID()
  noteId: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  includeChildren?: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}

@InputType()
export class ShareNoteInput {
  @Field()
  @IsUUID()
  noteId: string;

  @Field()
  @IsEmail()
  email: string;

  @Field(() => NotePermission)
  @IsEnum(NotePermission)
  permission: NotePermission;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  includeChildren?: boolean;
}

@InputType()
export class SetNoteTagsInput {
  @Field()
  @IsUUID()
  noteId: string;

  @Field(() => [String])
  @IsString({ each: true })
  tags: string[];
}

@InputType()
export class AddNoteAttachmentInput {
  @Field()
  @IsUUID()
  noteId: string;

  @Field()
  @IsUrl({ require_tld: false })
  url: string;

  @Field()
  @IsString()
  @MaxLength(500)
  filename: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  size?: number;
}
