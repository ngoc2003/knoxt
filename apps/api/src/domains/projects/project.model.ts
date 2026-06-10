import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { Customer } from '../customers/customer.model';
import { Task } from '../tasks/task.model';
import { User } from '../users/user.model';
import { ProjectRole } from '../../core/common/enum/enums';

@ObjectType()
export class ProjectColumn {
  @Field(() => ID)
  id: string;

  @Field()
  key: string;

  @Field()
  name: string;

  @Field(() => Int)
  orderIndex: number;
}

@ObjectType()
export class ProjectMember {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ProjectRole)
  role: ProjectRole;

  @Field(() => User)
  user: User;
}

@ObjectType()
export class ProjectInvitation {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => ProjectRole)
  role: ProjectRole;
}

@ObjectType()
export class ProjectShareResult {
  @Field()
  status: string;

  @Field(() => ProjectMember, { nullable: true })
  member?: ProjectMember | null;

  @Field(() => ProjectInvitation, { nullable: true })
  invitation?: ProjectInvitation | null;

  @Field()
  emailSent: boolean;
}

@ObjectType()
export class Project {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => ID)
  customerId: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => Customer)
  customer: Customer;

  @Field(() => String)
  status: string;

  @Field(() => GraphQLISODateTime)
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endDate?: Date;

  @Field(() => [Task])
  tasks: Task[];

  @Field(() => [ProjectColumn])
  columns: ProjectColumn[];

  @Field(() => [ProjectMember], { nullable: true })
  members?: ProjectMember[];

  @Field(() => [ProjectInvitation], { nullable: true })
  invitations?: ProjectInvitation[];
}
