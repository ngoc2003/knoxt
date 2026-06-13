import { PrismaTaskRepository } from './prisma-task.repository';
import { orderKeyForIndex } from './task-order-key';

describe('PrismaTaskRepository bulkMoveTasks', () => {
  const task = {
    findMany: jest.fn(),
    update: jest.fn(),
  };
  const prisma = {
    task,
    $transaction: jest.fn((callback: (tx: { task: typeof task }) => unknown) =>
      callback({ task }),
    ),
  };
  const repository = new PrismaTaskRepository(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('appends selected tasks to the destination in input order', async () => {
    task.findMany
      .mockResolvedValueOnce([{ id: 'selected-2' }, { id: 'selected-1' }])
      .mockResolvedValueOnce([{ id: 'existing-1' }, { id: 'existing-2' }])
      .mockResolvedValueOnce([
        { id: 'selected-1', status: 'doing' },
        { id: 'selected-2', status: 'doing' },
      ]);
    task.update.mockResolvedValue({});

    const result = await repository.bulkMoveTasks('user-id', {
      projectId: 'project-id',
      taskIds: ['selected-2', 'selected-1'],
      status: 'doing',
    });

    expect(task.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'existing-1' },
      data: { status: 'doing', orderKey: orderKeyForIndex(0) },
    });
    expect(task.update).toHaveBeenNthCalledWith(3, {
      where: { id: 'selected-2' },
      data: { status: 'doing', orderKey: orderKeyForIndex(2) },
    });
    expect(task.update).toHaveBeenNthCalledWith(4, {
      where: { id: 'selected-1' },
      data: { status: 'doing', orderKey: orderKeyForIndex(3) },
    });
    expect(result.map(({ id }) => id)).toEqual(['selected-2', 'selected-1']);
  });

  it('does not update anything when transaction validation fails', async () => {
    task.findMany.mockResolvedValueOnce([{ id: 'selected-1' }]);

    await expect(
      repository.bulkMoveTasks('user-id', {
        projectId: 'project-id',
        taskIds: ['selected-1', 'missing-task'],
        status: 'doing',
      }),
    ).rejects.toThrow('Selected tasks changed');

    expect(task.update).not.toHaveBeenCalled();
  });
});
