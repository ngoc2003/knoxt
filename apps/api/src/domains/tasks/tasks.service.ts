import {
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { TASK_REPOSITORY } from '../../core/constants/repository.tokens';
import type { ITaskRepository } from './application/ports/task.repository';
import {
  BulkMoveTasksInput,
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
    await this.ensureProjectColumn(
      userId,
      data.projectId,
      data.status ?? 'todo',
    );
    await this.ensureProjectMember(data.projectId, data.assigneeId);
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
    const task = await this.findOne(userId, id);
    if (data.status) {
      await this.ensureProjectColumn(userId, task.projectId, data.status);
    }
    await this.ensureProjectMember(task.projectId, data.assigneeId);

    const { status, ...taskData } = data;
    const updatedTask = await this.taskRepo.update(userId, id, taskData);
    if (status === undefined || status === task.status) return updatedTask;

    return this.taskRepo.moveTask(userId, {
      id,
      status,
      orderIndex: Number.MAX_SAFE_INTEGER,
    });
  }

  async moveTask(userId: string, input: MoveTaskInput) {
    const task = await this.findOne(userId, input.id);
    await this.ensureProjectColumn(userId, task.projectId, input.status);
    return this.taskRepo.moveTask(userId, input);
  }

  async bulkMoveTasks(userId: string, input: BulkMoveTasksInput) {
    if (input.taskIds.length === 0) {
      throw new BadRequestException('At least one task must be selected');
    }
    if (new Set(input.taskIds).size !== input.taskIds.length) {
      throw new BadRequestException('Task IDs must be unique');
    }

    await this.ensureProjectColumn(userId, input.projectId, input.status);
    const tasks = await this.taskRepo.findByIds(userId, input.taskIds);
    if (
      tasks.length !== input.taskIds.length ||
      tasks.some((task) => task.projectId !== input.projectId)
    ) {
      throw new BadRequestException(
        'All selected tasks must exist in the specified project',
      );
    }

    return this.taskRepo.bulkMoveTasks(userId, input);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.taskRepo.remove(userId, id);
  }

  private async ensureProjectColumn(
    userId: string,
    projectId: string,
    status: string,
  ) {
    const exists = await this.taskRepo.projectHasColumn(
      userId,
      projectId,
      status,
    );
    if (!exists) {
      throw new BadRequestException(
        `Column '${status}' does not exist in this project`,
      );
    }
  }

  private async ensureProjectMember(
    projectId: string,
    assigneeId?: string | null,
  ) {
    if (!assigneeId) return;

    const exists = await this.taskRepo.projectHasMember(projectId, assigneeId);
    if (!exists) {
      throw new BadRequestException('Assignee must be a project member');
    }
  }
}
