import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { Priority } from '../../core/common/enum/enums';
import { Project } from '../projects/project.model';
import { User } from '../users/user.model';

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

  @Field()
  status: string;

  @Field(() => Priority)
  priority: Priority;

  @Field()
  orderKey: string;

  @Field(() => ID)
  projectId: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  dueDate?: Date | null;

  @Field(() => ID, { nullable: true })
  assigneeId?: string | null;

  @Field(() => User, { nullable: true })
  assignee?: User | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => Project)
  project: Project;

  @Field(() => [Tag], { nullable: true })
  tags?: Tag[];
}
