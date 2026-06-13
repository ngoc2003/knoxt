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
import { ProjectRole, ProjectStatus } from '../../core/common/enum/enums';

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

  @Field(() => ID, { nullable: true })
  customerId?: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => Customer, { nullable: true })
  customer?: Customer | null;

  @Field(() => ProjectStatus)
  status: ProjectStatus;

  @Field(() => GraphQLISODateTime, { nullable: true })
  startDate?: Date | null;

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

  @Field(() => Int, { nullable: true })
  noteCount?: number;
}

@ObjectType()
export class ProjectOverviewNote {
  @Field(() => ID) id: string;
  @Field() title: string;
  @Field(() => GraphQLISODateTime) updatedAt: Date;
}

@ObjectType()
export class ProjectOverviewAttachment {
  @Field(() => ID) id: string;
  @Field(() => ID) noteId: string;
  @Field() noteTitle: string;
  @Field() filename: string;
  @Field() url: string;
  @Field(() => GraphQLISODateTime) createdAt: Date;
}

@ObjectType()
export class ProjectOverview {
  @Field(() => [ProjectOverviewNote]) recentNotes: ProjectOverviewNote[];
  @Field(() => [ProjectOverviewNote]) pinnedNotes: ProjectOverviewNote[];
  @Field(() => [ProjectOverviewAttachment])
  recentAttachments: ProjectOverviewAttachment[];
}
