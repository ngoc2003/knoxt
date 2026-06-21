import { Field, GraphQLISODateTime, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
} from 'class-validator';
import {
  ActionItemStatus,
  DecisionStatus,
  MeetingStatus,
  ProjectKnowledgeType,
  RequirementPriority,
  RequirementStatus,
} from '../../core/common/enum/enums';

@InputType({ isAbstract: true })
export class ProjectEntityInput {
  @Field() @IsUUID() projectId: string;
  @Field() @IsString() @MaxLength(500) title: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  sourceNoteId?: string | null;
}

@InputType()
export class CreateDecisionInput extends ProjectEntityInput {
  @Field() @IsString() @MaxLength(50000) description: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  reason?: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  impact?: string;
  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  decidedAt?: Date;
  @Field(() => DecisionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(DecisionStatus)
  status?: DecisionStatus;
}

@InputType()
export class UpdateDecisionInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  description?: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  reason?: string | null;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  impact?: string | null;
  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  decidedAt?: Date | null;
  @Field(() => DecisionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(DecisionStatus)
  status?: DecisionStatus;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  sourceNoteId?: string | null;
}

@InputType()
export class CreateMeetingInput extends ProjectEntityInput {
  @Field(() => GraphQLISODateTime)
  @IsDate()
  scheduledAt: Date;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  summary?: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  recordingUrl?: string;
  @Field(() => MeetingStatus, { nullable: true })
  @IsOptional()
  @IsEnum(MeetingStatus)
  status?: MeetingStatus;
}

@InputType()
export class UpdateMeetingInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;
  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  scheduledAt?: Date;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  summary?: string | null;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  recordingUrl?: string | null;
  @Field(() => MeetingStatus, { nullable: true })
  @IsOptional()
  @IsEnum(MeetingStatus)
  status?: MeetingStatus;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  sourceNoteId?: string | null;
}

@InputType()
export class CreateRequirementInput extends ProjectEntityInput {
  @Field() @IsString() @MaxLength(50000) description: string;
  @Field(() => RequirementPriority, { nullable: true })
  @IsOptional()
  @IsEnum(RequirementPriority)
  priority?: RequirementPriority;
  @Field(() => RequirementStatus, { nullable: true })
  @IsOptional()
  @IsEnum(RequirementStatus)
  status?: RequirementStatus;
}

@InputType()
export class UpdateRequirementInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  description?: string;
  @Field(() => RequirementPriority, { nullable: true })
  @IsOptional()
  @IsEnum(RequirementPriority)
  priority?: RequirementPriority;
  @Field(() => RequirementStatus, { nullable: true })
  @IsOptional()
  @IsEnum(RequirementStatus)
  status?: RequirementStatus;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  sourceNoteId?: string | null;
}

@InputType()
export class StructuredFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  statuses?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  priorities?: string[];

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  from?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  to?: Date;
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  includeDeleted?: boolean;
}

@InputType()
export class AddMeetingParticipantInput {
  @Field() @IsUUID() meetingId: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  externalName?: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  externalEmail?: string;
}

@InputType()
export class CreateActionItemInput {
  @Field() @IsUUID() meetingId: string;
  @Field() @IsString() @MaxLength(500) title: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  description?: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  externalAssigneeName?: string;
  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  dueDate?: Date;
  @Field(() => ActionItemStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ActionItemStatus)
  status?: ActionItemStatus;
}

@InputType()
export class UpdateActionItemInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  description?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsUUID() assigneeId?:
    | string
    | null;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  externalAssigneeName?: string | null;
  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  dueDate?: Date | null;
  @Field(() => ActionItemStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ActionItemStatus)
  status?: ActionItemStatus;
}

@InputType()
export class ProjectKnowledgeSearchInput {
  @Field() @IsUUID() projectId: string;
  @Field() @IsString() @MaxLength(200) query: string;
  @Field(() => [ProjectKnowledgeType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ProjectKnowledgeType, { each: true })
  types?: ProjectKnowledgeType[];
}
