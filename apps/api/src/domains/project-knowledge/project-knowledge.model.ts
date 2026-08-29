import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import {
  ActionItemStatus,
  DecisionStatus,
  MeetingStatus,
  ProjectKnowledgeType,
  RequirementPriority,
  RequirementStatus,
} from '../../core/common/enum/enums';
import { Task } from '../tasks/task.model';
import { User } from '../users/user.model';

@ObjectType()
export class Decision {
  @Field(() => ID) id: string;
  @Field(() => ID) projectId: string;
  @Field(() => ID, { nullable: true }) sourceNoteId?: string | null;
  @Field() title: string;
  @Field() description: string;
  @Field(() => String, { nullable: true }) reason?: string | null;
  @Field(() => String, { nullable: true }) impact?: string | null;
  @Field(() => GraphQLISODateTime, { nullable: true }) decidedAt?: Date | null;
  @Field(() => DecisionStatus) status: DecisionStatus;
  @Field(() => GraphQLISODateTime) createdAt: Date;
  @Field(() => GraphQLISODateTime) updatedAt: Date;
  @Field(() => GraphQLISODateTime, { nullable: true }) deletedAt?: Date | null;
}

@ObjectType()
export class MeetingParticipant {
  @Field(() => ID) id: string;
  @Field(() => ID, { nullable: true }) userId?: string | null;
  @Field(() => User, { nullable: true }) user?: User | null;
  @Field(() => String, { nullable: true }) externalName?: string | null;
  @Field(() => String, { nullable: true }) externalEmail?: string | null;
}

@ObjectType()
export class ActionItem {
  @Field(() => ID) id: string;
  @Field(() => ID) meetingId: string;
  @Field(() => ID, { nullable: true }) assigneeId?: string | null;
  @Field(() => User, { nullable: true }) assignee?: User | null;
  @Field(() => String, { nullable: true }) externalAssigneeName?: string | null;
  @Field(() => ID, { nullable: true }) promotedTaskId?: string | null;
  @Field(() => Task, { nullable: true }) promotedTask?: Task | null;
  @Field() title: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => GraphQLISODateTime, { nullable: true }) dueDate?: Date | null;
  @Field(() => ActionItemStatus) status: ActionItemStatus;
  @Field(() => GraphQLISODateTime) createdAt: Date;
  @Field(() => GraphQLISODateTime) updatedAt: Date;
  @Field(() => GraphQLISODateTime, { nullable: true }) deletedAt?: Date | null;
}

@ObjectType()
export class Meeting {
  @Field(() => ID) id: string;
  @Field(() => ID) projectId: string;
  @Field(() => ID, { nullable: true }) sourceNoteId?: string | null;
  @Field() title: string;
  @Field(() => GraphQLISODateTime) scheduledAt: Date;
  @Field(() => String, { nullable: true }) summary?: string | null;
  @Field(() => String, { nullable: true }) recordingUrl?: string | null;
  @Field(() => MeetingStatus) status: MeetingStatus;
  @Field(() => [MeetingParticipant]) participants: MeetingParticipant[];
  @Field(() => [ActionItem]) actionItems: ActionItem[];
  @Field(() => GraphQLISODateTime) createdAt: Date;
  @Field(() => GraphQLISODateTime) updatedAt: Date;
  @Field(() => GraphQLISODateTime, { nullable: true }) deletedAt?: Date | null;
}

@ObjectType()
export class Requirement {
  @Field(() => ID) id: string;
  @Field(() => ID) projectId: string;
  @Field(() => ID, { nullable: true }) sourceNoteId?: string | null;
  @Field() title: string;
  @Field() description: string;
  @Field(() => RequirementPriority) priority: RequirementPriority;
  @Field(() => RequirementStatus) status: RequirementStatus;
  @Field(() => GraphQLISODateTime) createdAt: Date;
  @Field(() => GraphQLISODateTime) updatedAt: Date;
  @Field(() => GraphQLISODateTime, { nullable: true }) deletedAt?: Date | null;
}

function pageType<T>(name: string, item: () => new () => T) {
  @ObjectType(name)
  class Page {
    @Field(() => [item()]) items: T[];
    @Field(() => Int) total: number;
    @Field(() => Int) skip: number;
    @Field(() => Int) take: number;
    @Field() hasMore: boolean;
  }
  return Page;
}

export const DecisionPage = pageType('DecisionPage', () => Decision);
export const MeetingPage = pageType('MeetingPage', () => Meeting);
export const RequirementPage = pageType('RequirementPage', () => Requirement);

@ObjectType()
export class ProjectKnowledgeSearchResult {
  @Field(() => ID) id: string;
  @Field(() => ID) projectId: string;
  @Field(() => ProjectKnowledgeType) type: ProjectKnowledgeType;
  @Field() title: string;
  @Field() snippet: string;
  @Field(() => String, { nullable: true }) status?: string | null;
  @Field(() => GraphQLISODateTime) updatedAt: Date;
}

@ObjectType()
export class ProjectKnowledgeSearchPage {
  @Field(() => [ProjectKnowledgeSearchResult])
  items: ProjectKnowledgeSearchResult[];
  @Field(() => Int) total: number;
  @Field(() => Int) skip: number;
  @Field(() => Int) take: number;
  @Field() hasMore: boolean;
}

@ObjectType()
export class ProjectActivity {
  @Field(() => ID) id: string;
  @Field(() => ID) projectId: string;
  @Field(() => ID) userId: string;
  @Field() action: string;
  @Field(() => String, { nullable: true }) entity?: string | null;
  @Field(() => ID, { nullable: true }) entityId?: string | null;
  @Field(() => GraphQLISODateTime) createdAt: Date;
}

@ObjectType()
export class ProjectActivityPage {
  @Field(() => [ProjectActivity]) items: ProjectActivity[];
  @Field(() => Int) total: number;
  @Field(() => Int) skip: number;
  @Field(() => Int) take: number;
  @Field() hasMore: boolean;
}

@ObjectType()
export class DraftDecision {
  @Field() title: string;
  @Field() description: string;
  @Field(() => String, { nullable: true }) reason?: string | null;
}

@ObjectType()
export class DraftActionItem {
  @Field() title: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) externalAssigneeName?: string | null;
  @Field(() => GraphQLISODateTime, { nullable: true }) dueDate?: Date | null;
}

@ObjectType()
export class MeetingIntelligenceDraft {
  @Field() title: string;
  @Field() summary: string;
  @Field(() => [DraftDecision]) decisions: DraftDecision[];
  @Field(() => [DraftActionItem]) actionItems: DraftActionItem[];
  @Field(() => [String]) warnings: string[];
}
