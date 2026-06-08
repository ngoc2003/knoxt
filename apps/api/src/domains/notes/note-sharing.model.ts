import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { NotePermission } from '../../core/common/enum/enums';
import { User } from '../users/user.model';

@ObjectType()
export class NoteShare {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  noteId: string;

  @Field(() => ID)
  userId: string;

  @Field(() => NotePermission)
  permission: NotePermission;

  @Field()
  includeChildren: boolean;

  @Field(() => User)
  user: User;
}

@ObjectType()
export class NotePublicLink {
  @Field(() => ID)
  id: string;

  @Field()
  includeChildren: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  expiresAt?: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  revokedAt?: Date | null;
}

@ObjectType()
export class NotePublicLinkResult {
  @Field()
  token: string;

  @Field(() => NotePublicLink)
  link: NotePublicLink;
}

@ObjectType()
export class NoteTag {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  color?: string | null;
}

@ObjectType()
export class NoteAttachment {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field()
  filename: string;

  @Field(() => String, { nullable: true })
  mimeType?: string | null;

  @Field(() => Int, { nullable: true })
  size?: number | null;
}

@ObjectType()
export class NoteWorkspaceMeta {
  @Field(() => [NoteTag])
  tags: NoteTag[];

  @Field(() => [NoteAttachment])
  attachments: NoteAttachment[];

  @Field(() => [NoteShare])
  shares: NoteShare[];

  @Field(() => NotePublicLink, { nullable: true })
  publicLink?: NotePublicLink | null;
}

@ObjectType()
export class PublicNote {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => ID, { nullable: true })
  parentId?: string | null;

  @Field(() => Int)
  position: number;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

@ObjectType()
export class PublicNoteResult {
  @Field(() => PublicNote)
  note: PublicNote;

  @Field(() => [PublicNote])
  children: PublicNote[];
}
