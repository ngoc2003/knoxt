import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { Priority, TaskStatus } from '../../common/enums';
import { Project } from '../projects/project.model';

@ObjectType()
export class Tag {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  color?: string | null;
}

@ObjectType()
export class Task {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => TaskStatus)
  status: TaskStatus;

  @Field(() => Priority)
  priority: Priority;

  @Field(() => Int)
  orderIndex: number;

  @Field(() => ID)
  projectId: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  dueDate?: Date | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => Project)
  project: Project;

  @Field(() => [Tag], { nullable: true })
  tags?: Tag[];
}
