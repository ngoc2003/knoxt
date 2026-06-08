import { BadRequestException } from '@nestjs/common';
import type { ITaskRepository } from './application/ports/task.repository';
import { TasksService } from './tasks.service';

describe('TasksService assignees', () => {
  const taskRepo = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    moveTask: jest.fn(),
    projectHasColumn: jest.fn(),
    projectHasMember: jest.fn(),
  } as unknown as jest.Mocked<ITaskRepository>;
  const service = new TasksService(taskRepo);

  beforeEach(() => jest.clearAllMocks());

  it('allows a task to be created without an assignee', async () => {
    taskRepo.projectHasColumn.mockResolvedValue(true);
    taskRepo.create.mockResolvedValue({ id: 'task-id' } as never);

    await service.create('user-id', {
      title: 'Unassigned task',
      projectId: 'project-id',
      assigneeId: null,
    });

    expect(taskRepo.projectHasMember).not.toHaveBeenCalled();
    expect(taskRepo.create).toHaveBeenCalled();
  });

  it('rejects an assignee who is not a project member', async () => {
    taskRepo.projectHasColumn.mockResolvedValue(true);
    taskRepo.projectHasMember.mockResolvedValue(false);

    await expect(
      service.create('user-id', {
        title: 'Assigned task',
        projectId: 'project-id',
        assigneeId: 'outside-user-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(taskRepo.create).not.toHaveBeenCalled();
  });

  it('reorders a task when an update changes its status', async () => {
    taskRepo.findOne.mockResolvedValue({
      id: 'task-id',
      projectId: 'project-id',
      status: 'todo',
      orderKey: '0000000000000001',
    } as never);
    taskRepo.projectHasColumn.mockResolvedValue(true);
    taskRepo.update.mockResolvedValue({ id: 'task-id' } as never);
    taskRepo.moveTask.mockResolvedValue({ id: 'task-id' } as never);

    await service.update('user-id', 'task-id', { status: 'doing' });

    expect(taskRepo.update).toHaveBeenCalledWith('user-id', 'task-id', {});
    expect(taskRepo.moveTask).toHaveBeenCalledWith('user-id', {
      id: 'task-id',
      status: 'doing',
      orderIndex: Number.MAX_SAFE_INTEGER,
    });
  });
});
