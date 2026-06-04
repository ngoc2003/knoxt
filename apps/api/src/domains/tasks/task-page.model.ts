import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Task } from './task.model';

@ObjectType()
export class TaskPage {
  @Field(() => [Task])
  items: Task[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}
