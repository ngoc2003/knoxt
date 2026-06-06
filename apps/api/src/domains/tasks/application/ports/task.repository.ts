import type { Task, TaskTag } from 'database/generated/client';
import type {
  PaginationInput,
  PageResult,
} from '../../../../core/common/dtos/pagination.dto';
import type {
  CreateTaskInput,
  ListTasksInput,
  MoveTaskInput,
  UpdateTaskInput,
} from '../../dto/task.dto';

export type TaskWithTags = Task & { tags: TaskTag[] };

export interface ITaskRepository {
  resolveTagIds(userId: string, tagNames: string[]): Promise<string[]>;
  create(userId: string, data: CreateTaskInput): Promise<Task>;
  findAll(
    userId: string,
    filter: ListTasksInput,
    pagination: PaginationInput,
  ): Promise<PageResult<TaskWithTags>>;
  findOne(userId: string, id: string): Promise<Task | null>;
  update(userId: string, id: string, data: UpdateTaskInput): Promise<Task>;
  moveTask(userId: string, input: MoveTaskInput): Promise<Task>;
  remove(userId: string, id: string): Promise<Task>;
  projectHasColumn(
    userId: string,
    projectId: string,
    status: string,
  ): Promise<boolean>;
  projectHasMember(projectId: string, memberId: string): Promise<boolean>;
}
