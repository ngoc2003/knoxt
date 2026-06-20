import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/common/guards/gql-auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../../core/common/decorators/current-user.decorator';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';
import { ProjectKnowledgeService } from './project-knowledge.service';
import {
  AddMeetingParticipantInput,
  CreateActionItemInput,
  CreateDecisionInput,
  CreateMeetingInput,
  CreateRequirementInput,
  ProjectKnowledgeSearchInput,
  StructuredFilterInput,
  UpdateActionItemInput,
  UpdateDecisionInput,
  UpdateMeetingInput,
  UpdateRequirementInput,
} from './project-knowledge.dto';
import {
  ActionItem,
  Decision,
  DecisionPage,
  Meeting,
  MeetingPage,
  MeetingParticipant,
  ProjectActivityPage,
  ProjectKnowledgeSearchPage,
  Requirement,
  RequirementPage,
} from './project-knowledge.model';
import { Task } from '../tasks/task.model';

@Resolver()
@UseGuards(GqlAuthGuard)
export class ProjectKnowledgeResolver {
  constructor(private readonly service: ProjectKnowledgeService) {}

  @Query(() => DecisionPage) decisions(
    @CurrentUser() u: AuthUser,
    @Args('projectId') p: string,
    @Args('filter', { nullable: true }) f?: StructuredFilterInput,
    @Args('pagination', { nullable: true }) pg?: PaginationInput,
  ) {
    return this.service.decisions(u.id, p, f ?? {}, pg ?? {});
  }
  @Query(() => Decision) decision(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
  ) {
    return this.service.decision(u.id, id);
  }
  @Mutation(() => Decision) createDecision(
    @CurrentUser() u: AuthUser,
    @Args('data') d: CreateDecisionInput,
  ) {
    return this.service.createDecision(u.id, d);
  }
  @Mutation(() => Decision) updateDecision(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
    @Args('data') d: UpdateDecisionInput,
  ) {
    return this.service.updateDecision(u.id, id, d);
  }
  @Mutation(() => Decision) deleteDecision(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
  ) {
    return this.service.removeDecision(u.id, id);
  }
  @Mutation(() => Decision) restoreDecision(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
  ) {
    return this.service.removeDecision(u.id, id, true);
  }

  @Query(() => MeetingPage) meetings(
    @CurrentUser() u: AuthUser,
    @Args('projectId') p: string,
    @Args('filter', { nullable: true }) f?: StructuredFilterInput,
    @Args('pagination', { nullable: true }) pg?: PaginationInput,
  ) {
    return this.service.meetings(u.id, p, f ?? {}, pg ?? {});
  }
  @Query(() => Meeting) meeting(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
  ) {
    return this.service.meeting(u.id, id);
  }
  @Mutation(() => Meeting) createMeeting(
    @CurrentUser() u: AuthUser,
    @Args('data') d: CreateMeetingInput,
  ) {
    return this.service.createMeeting(u.id, d);
  }
  @Mutation(() => Meeting) updateMeeting(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
    @Args('data') d: UpdateMeetingInput,
  ) {
    return this.service.updateMeeting(u.id, id, d);
  }
  @Mutation(() => Meeting) deleteMeeting(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
  ) {
    return this.service.removeMeeting(u.id, id);
  }
  @Mutation(() => Meeting) restoreMeeting(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
  ) {
    return this.service.removeMeeting(u.id, id, true);
  }
  @Mutation(() => MeetingParticipant) addMeetingParticipant(
    @CurrentUser() u: AuthUser,
    @Args('data') d: AddMeetingParticipantInput,
  ) {
    return this.service.addParticipant(u.id, d);
  }
  @Mutation(() => MeetingParticipant) removeMeetingParticipant(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
  ) {
    return this.service.removeParticipant(u.id, id);
  }
  @Mutation(() => ActionItem) createActionItem(
    @CurrentUser() u: AuthUser,
    @Args('data') d: CreateActionItemInput,
  ) {
    return this.service.createActionItem(u.id, d);
  }
  @Mutation(() => ActionItem) updateActionItem(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
    @Args('data') d: UpdateActionItemInput,
  ) {
    return this.service.updateActionItem(u.id, id, d);
  }
  @Mutation(() => ActionItem) deleteActionItem(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
  ) {
    return this.service.removeActionItem(u.id, id);
  }
  @Mutation(() => ActionItem) restoreActionItem(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
  ) {
    return this.service.removeActionItem(u.id, id, true);
  }
  @Mutation(() => Task) promoteActionItem(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
  ) {
    return this.service.promote(u.id, id);
  }

  @Query(() => RequirementPage) requirements(
    @CurrentUser() u: AuthUser,
    @Args('projectId') p: string,
    @Args('filter', { nullable: true }) f?: StructuredFilterInput,
    @Args('pagination', { nullable: true }) pg?: PaginationInput,
  ) {
    return this.service.requirements(u.id, p, f ?? {}, pg ?? {});
  }
  @Query(() => Requirement) requirement(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
  ) {
    return this.service.requirement(u.id, id);
  }
  @Mutation(() => Requirement) createRequirement(
    @CurrentUser() u: AuthUser,
    @Args('data') d: CreateRequirementInput,
  ) {
    return this.service.createRequirement(u.id, d);
  }
  @Mutation(() => Requirement) updateRequirement(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
    @Args('data') d: UpdateRequirementInput,
  ) {
    return this.service.updateRequirement(u.id, id, d);
  }
  @Mutation(() => Requirement) deleteRequirement(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
  ) {
    return this.service.removeRequirement(u.id, id);
  }
  @Mutation(() => Requirement) restoreRequirement(
    @CurrentUser() u: AuthUser,
    @Args('id') id: string,
  ) {
    return this.service.removeRequirement(u.id, id, true);
  }

  @Query(() => ProjectKnowledgeSearchPage) projectKnowledgeSearch(
    @CurrentUser() u: AuthUser,
    @Args('input') i: ProjectKnowledgeSearchInput,
    @Args('pagination', { nullable: true }) p?: PaginationInput,
  ) {
    return this.service.search(u.id, i, p ?? {});
  }
  @Query(() => ProjectActivityPage) projectActivity(
    @CurrentUser() u: AuthUser,
    @Args('projectId') id: string,
    @Args('pagination', { nullable: true }) p?: PaginationInput,
  ) {
    return this.service.activity(u.id, id, p ?? {});
  }
}
