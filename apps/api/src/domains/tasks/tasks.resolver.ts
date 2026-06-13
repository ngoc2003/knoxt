import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.model';
import { TaskPage } from './task-page.model';
import {
  BulkMoveTasksInput,
  CreateTaskInput,
  ListTasksInput,
  MoveTaskInput,
  UpdateTaskInput,
} from './dto/task.dto';
import { GqlAuthGuard } from '../../core/common/guards/gql-auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../../core/common/decorators/current-user.decorator';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';
import { PermissionGuard } from '../../core/authorization/permission.guard';
import { RequirePermission } from '../../core/authorization/require-permission.decorator';
import { Permission } from '../../core/common/enum/enums';

@Resolver(() => Task)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Query(() => TaskPage)
  tasks(
    @CurrentUser() user: AuthUser,
    @Args('filter', { nullable: true }) filter?: ListTasksInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.tasksService.findAll(user.id, filter ?? {}, pagination ?? {});
  }

  @Query(() => Task)
  @RequirePermission(Permission.projectRead, 'task', 'id')
  taskDetail(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.tasksService.findOne(user.id, id);
  }

  @Mutation(() => Task)
  @RequirePermission(Permission.projectEdit, 'project', 'data.projectId')
  createTask(
    @CurrentUser() user: AuthUser,
    @Args('data') data: CreateTaskInput,
  ) {
    return this.tasksService.create(user.id, data);
  }

  @Mutation(() => Task)
  @RequirePermission(Permission.projectEdit, 'task', 'id')
  updateTask(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('data') data: UpdateTaskInput,
  ) {
    return this.tasksService.update(user.id, id, data);
  }

  @Mutation(() => Task)
  @RequirePermission(Permission.projectEdit, 'task', 'input.id')
  moveTask(@CurrentUser() user: AuthUser, @Args('input') input: MoveTaskInput) {
    return this.tasksService.moveTask(user.id, input);
  }

  @Mutation(() => [Task])
  @RequirePermission(Permission.projectEdit, 'project', 'input.projectId')
  bulkMoveTasks(
    @CurrentUser() user: AuthUser,
    @Args('input') input: BulkMoveTasksInput,
  ) {
    return this.tasksService.bulkMoveTasks(user.id, input);
  }

  @Mutation(() => Task)
  @RequirePermission(Permission.projectEdit, 'task', 'id')
  deleteTask(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.tasksService.remove(user.id, id);
  }
}
