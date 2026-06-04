import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.model';
import { TaskPage } from './task-page.model';
import {
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

@Resolver(() => Task)
@UseGuards(GqlAuthGuard)
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
  taskDetail(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.tasksService.findOne(user.id, id);
  }

  @Mutation(() => Task)
  createTask(
    @CurrentUser() user: AuthUser,
    @Args('data') data: CreateTaskInput,
  ) {
    return this.tasksService.create(user.id, data);
  }

  @Mutation(() => Task)
  updateTask(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('data') data: UpdateTaskInput,
  ) {
    return this.tasksService.update(user.id, id, data);
  }

  @Mutation(() => Task)
  moveTask(@CurrentUser() user: AuthUser, @Args('input') input: MoveTaskInput) {
    return this.tasksService.moveTask(user.id, input);
  }

  @Mutation(() => Task)
  deleteTask(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.tasksService.remove(user.id, id);
  }
}
