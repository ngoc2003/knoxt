import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './project.model';
import { ProjectPage } from './project-page.model';
import { CreateProjectInput, UpdateProjectInput } from './dto/project.dto';
import { GqlAuthGuard } from '../../core/common/guards/gql-auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../../core/common/decorators/current-user.decorator';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';

@Resolver(() => Project)
@UseGuards(GqlAuthGuard)
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
  updateProject(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('data') data: UpdateProjectInput,
  ) {
    return this.projectsService.update(user.id, id, data);
  }

  @Mutation(() => Project)
  deleteProject(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.projectsService.remove(user.id, id);
  }
}
