import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { NoteTag } from './note-sharing.model';

@ObjectType()
export class NoteSearchResult {
  @Field(() => ID) id: string;
  @Field(() => ID, { nullable: true }) projectId?: string | null;
  @Field(() => String, { nullable: true }) projectName?: string | null;
  @Field() title: string;
  @Field() snippet: string;
  @Field(() => [NoteTag]) tags: NoteTag[];
  @Field(() => Int) score: number;
  @Field(() => GraphQLISODateTime) updatedAt: Date;
}

@ObjectType()
export class NoteSearchPage {
  @Field(() => [NoteSearchResult]) items: NoteSearchResult[];
  @Field(() => Int) total: number;
  @Field(() => Int) skip: number;
  @Field(() => Int) take: number;
}
