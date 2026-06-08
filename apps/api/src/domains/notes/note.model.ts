import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';

@ObjectType()
export class Note {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => ID, { nullable: true })
  customerId?: string | null;

  @Field(() => ID, { nullable: true })
  parentId?: string | null;

  @Field(() => Int)
  position: number;

  @Field(() => Int)
  version: number;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt?: Date | null;
}

@ObjectType()
export class NoteTreeItem {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  parentId?: string | null;

  @Field()
  title: string;

  @Field(() => Int)
  position: number;

  @Field()
  isPinned: boolean;

  @Field()
  hasChildren: boolean;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
