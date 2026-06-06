import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Note } from './note.model';

@ObjectType()
export class NotePage {
  @Field(() => [Note])
  items: Note[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}
