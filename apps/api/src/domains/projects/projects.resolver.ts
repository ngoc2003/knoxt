import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  Project,
  ProjectColumn,
  ProjectInvitation,
  ProjectMember,
  ProjectShareResult,
} from './project.model';
import { ProjectPage } from './project-page.model';
import {
  CreateProjectColumnInput,
  CreateProjectInput,
  DeleteProjectColumnInput,
  AddProjectMemberInput,
  CancelProjectInvitationInput,
  RemoveProjectMemberInput,
  ReorderProjectColumnsInput,
  UpdateProjectMemberRoleInput,
  UpdateProjectInput,
} from './dto/project.dto';
import { GqlAuthGuard } from '../../core/common/guards/gql-auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../../core/common/decorators/current-user.decorator';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';
import { PermissionGuard } from '../../core/authorization/permission.guard';
import { RequirePermission } from '../../core/authorization/require-permission.decorator';
import { Permission } from '../../core/common/enum/enums';

@Resolver(() => Project)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @Query(() => ProjectPage)
  projects(
    @CurrentUser() user: AuthUser,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    @Args('customerId', { nullable: true }) customerId?: string,
  ) {
    return this.projectsService.findAll(user.id, pagination ?? {}, customerId);
  }

  @Query(() => ProjectPage)
  projectsByCustomer(
    @CurrentUser() user: AuthUser,
    @Args('customerId') customerId: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.projectsService.findAll(user.id, pagination ?? {}, customerId);
  }

  @Query(() => Project)
  @RequirePermission(Permission.projectRead, 'project', 'id')
  projectDetail(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.projectsService.findOne(user.id, id);
  }

  @Mutation(() => Project)
  createProject(
    @CurrentUser() user: AuthUser,
    @Args('data') data: CreateProjectInput,
  ) {
    return this.projectsService.create(user.id, data);
  }

  @Mutation(() => Project)
  @RequirePermission(Permission.projectEdit, 'project', 'id')
  updateProject(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('data') data: UpdateProjectInput,
  ) {
    return this.projectsService.update(user.id, id, data);
  }

  @Mutation(() => Project)
  @RequirePermission(Permission.projectDelete, 'project', 'id')
  deleteProject(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.projectsService.remove(user.id, id);
  }

  @Mutation(() => ProjectColumn)
  @RequirePermission(Permission.projectEdit, 'project', 'data.projectId')
  createProjectColumn(
    @CurrentUser() user: AuthUser,
    @Args('data') data: CreateProjectColumnInput,
  ) {
    return this.projectsService.createColumn(user.id, data);
  }

  @Mutation(() => [ProjectColumn])
  @RequirePermission(Permission.projectEdit, 'project', 'data.projectId')
  reorderProjectColumns(
    @CurrentUser() user: AuthUser,
    @Args('data') data: ReorderProjectColumnsInput,
  ) {
    return this.projectsService.reorderColumns(user.id, data);
  }

  @Mutation(() => ProjectColumn)
  @RequirePermission(Permission.projectEdit, 'project', 'data.projectId')
  deleteProjectColumn(
    @CurrentUser() user: AuthUser,
    @Args('data') data: DeleteProjectColumnInput,
  ) {
    return this.projectsService.deleteColumn(user.id, data);
  }

  @Mutation(() => ProjectShareResult)
  @RequirePermission(
    Permission.projectManageMembers,
    'project',
    'data.projectId',
  )
  addProjectMember(
    @CurrentUser() user: AuthUser,
    @Args('data') data: AddProjectMemberInput,
  ) {
    return this.projectsService.addMember(user.id, data);
  }

  @Mutation(() => ProjectMember)
  @RequirePermission(
    Permission.projectManageMembers,
    'project',
    'data.projectId',
  )
  updateProjectMemberRole(@Args('data') data: UpdateProjectMemberRoleInput) {
    return this.projectsService.updateMemberRole(data);
  }

  @Mutation(() => ProjectMember)
  @RequirePermission(
    Permission.projectManageMembers,
    'project',
    'data.projectId',
  )
  removeProjectMember(@Args('data') data: RemoveProjectMemberInput) {
    return this.projectsService.removeMember(data);
  }

  @Mutation(() => ProjectInvitation)
  @RequirePermission(
    Permission.projectManageMembers,
    'project',
    'data.projectId',
  )
  cancelProjectInvitation(@Args('data') data: CancelProjectInvitationInput) {
    return this.projectsService.cancelInvitation(data);
  }
}
