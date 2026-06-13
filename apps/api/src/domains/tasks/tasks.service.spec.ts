import { BadRequestException } from '@nestjs/common';
import type { ITaskRepository } from './application/ports/task.repository';
import { TasksService } from './tasks.service';

describe('TasksService assignees', () => {
  const taskRepo = {
    create: jest.fn(),
    findOne: jest.fn(),
    findByIds: jest.fn(),
    update: jest.fn(),
    moveTask: jest.fn(),
    bulkMoveTasks: jest.fn(),
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

  it('rejects an empty bulk move', async () => {
    await expect(
      service.bulkMoveTasks('user-id', {
        projectId: 'project-id',
        taskIds: [],
        status: 'doing',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(taskRepo.bulkMoveTasks).not.toHaveBeenCalled();
  });

  it('rejects duplicate task IDs in a bulk move', async () => {
    await expect(
      service.bulkMoveTasks('user-id', {
        projectId: 'project-id',
        taskIds: ['task-id', 'task-id'],
        status: 'doing',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a bulk move to a missing project column', async () => {
    taskRepo.projectHasColumn.mockResolvedValue(false);

    await expect(
      service.bulkMoveTasks('user-id', {
        projectId: 'project-id',
        taskIds: ['task-id'],
        status: 'missing',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(taskRepo.findByIds).not.toHaveBeenCalled();
  });

  it('rejects a bulk move when a selected task does not exist', async () => {
    taskRepo.projectHasColumn.mockResolvedValue(true);
    taskRepo.findByIds.mockResolvedValue([]);

    await expect(
      service.bulkMoveTasks('user-id', {
        projectId: 'project-id',
        taskIds: ['missing-task'],
        status: 'doing',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(taskRepo.bulkMoveTasks).not.toHaveBeenCalled();
  });

  it('rejects a bulk move when a selected task is outside the project', async () => {
    taskRepo.projectHasColumn.mockResolvedValue(true);
    taskRepo.findByIds.mockResolvedValue([
      { id: 'task-id', projectId: 'other-project-id' },
    ] as never);

    await expect(
      service.bulkMoveTasks('user-id', {
        projectId: 'project-id',
        taskIds: ['task-id'],
        status: 'doing',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(taskRepo.bulkMoveTasks).not.toHaveBeenCalled();
  });

  it('bulk moves valid tasks', async () => {
    const input = {
      projectId: 'project-id',
      taskIds: ['first-task-id', 'second-task-id'],
      status: 'doing',
    };
    taskRepo.projectHasColumn.mockResolvedValue(true);
    taskRepo.findByIds.mockResolvedValue([
      { id: 'first-task-id', projectId: 'project-id' },
      { id: 'second-task-id', projectId: 'project-id' },
    ] as never);
    taskRepo.bulkMoveTasks.mockResolvedValue([] as never);

    await service.bulkMoveTasks('user-id', input);

    expect(taskRepo.bulkMoveTasks).toHaveBeenCalledWith('user-id', input);
  });
});
