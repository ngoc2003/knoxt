import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TASK_REPOSITORY } from '../../core/constants/repository.tokens';
import type { ITaskRepository } from './application/ports/task.repository';
import {
  CreateTaskInput,
  ListTasksInput,
  MoveTaskInput,
  UpdateTaskInput,
} from './dto/task.dto';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepo: ITaskRepository,
  ) {}

  async create(userId: string, data: CreateTaskInput) {
    return this.taskRepo.create(userId, data);
  }

  async findAll(
    userId: string,
    filter: ListTasksInput,
    pagination: PaginationInput,
  ) {
    return this.taskRepo.findAll(userId, filter, pagination);
  }

  async findOne(userId: string, id: string) {
    const task = await this.taskRepo.findOne(userId, id);
    if (!task) throw new NotFoundException(`Task not found: ${id}`);
    return task;
  }

  async update(userId: string, id: string, data: UpdateTaskInput) {
    await this.findOne(userId, id);
    return this.taskRepo.update(userId, id, data);
  }

  async moveTask(userId: string, input: MoveTaskInput) {
    await this.findOne(userId, input.id);
    return this.taskRepo.moveTask(userId, input);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.taskRepo.remove(userId, id);
  }
}
