import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { INoteRepository } from './application/ports/note.repository';
import { NotesService } from './notes.service';

describe('NotesService tree rules', () => {
  const noteRepo = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOwnedOne: jest.fn(),
    customerExists: jest.fn(),
    update: jest.fn(),
    setPinned: jest.fn(),
    findSiblings: jest.fn(),
    isDescendant: jest.fn(),
    move: jest.fn(),
    remove: jest.fn(),
  } as unknown as jest.Mocked<INoteRepository>;
  const service = new NotesService(noteRepo);

  beforeEach(() => jest.clearAllMocks());

  it('rejects creating a note under an inaccessible parent', async () => {
    noteRepo.findOwnedOne.mockResolvedValue(null);

    await expect(
      service.create('user-id', {
        title: 'Child',
        parentId: 'parent-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(noteRepo.create).not.toHaveBeenCalled();
  });

  it('rejects linking a note to a customer outside the owner account', async () => {
    noteRepo.customerExists.mockResolvedValue(false);

    await expect(
      service.create('user-id', {
        title: 'Customer note',
        customerId: 'customer-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(noteRepo.create).not.toHaveBeenCalled();
  });

  it('rejects moving a note into one of its descendants', async () => {
    noteRepo.findOwnedOne.mockResolvedValue({ id: 'note-id' } as never);
    noteRepo.isDescendant.mockResolvedValue(true);

    await expect(
      service.move('user-id', {
        id: 'note-id',
        parentId: 'descendant-id',
        orderedSiblingIds: ['note-id'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(noteRepo.move).not.toHaveBeenCalled();
  });

  it('requires the complete destination sibling order when moving', async () => {
    noteRepo.findOwnedOne.mockResolvedValue({ id: 'note-id' } as never);
    noteRepo.findSiblings.mockResolvedValue([
      { id: 'sibling-one' },
      { id: 'sibling-two' },
    ] as never);

    await expect(
      service.move('user-id', {
        id: 'note-id',
        orderedSiblingIds: ['note-id', 'sibling-one'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(noteRepo.move).not.toHaveBeenCalled();
  });

  it('moves a note when the destination sibling order is valid', async () => {
    noteRepo.findOwnedOne.mockResolvedValue({ id: 'note-id' } as never);
    noteRepo.findSiblings.mockResolvedValue([
      { id: 'sibling-one' },
      { id: 'sibling-two' },
    ] as never);
    noteRepo.move.mockResolvedValue({ id: 'note-id' } as never);

    await service.move('user-id', {
      id: 'note-id',
      orderedSiblingIds: ['sibling-two', 'note-id', 'sibling-one'],
    });

    expect(noteRepo.move).toHaveBeenCalledWith('user-id', {
      id: 'note-id',
      orderedSiblingIds: ['sibling-two', 'note-id', 'sibling-one'],
    });
  });

  it('returns a conflict instead of overwriting a stale note version', async () => {
    noteRepo.findOne.mockResolvedValue({ id: 'note-id' } as never);
    noteRepo.update.mockResolvedValue(null);

    await expect(
      service.update('user-id', 'note-id', {
        title: 'Stale title',
        expectedVersion: 2,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('allows an accessible note to be pinned for the current user', async () => {
    noteRepo.findOne.mockResolvedValue({ id: 'note-id' } as never);
    noteRepo.setPinned.mockResolvedValue(true);

    await expect(service.setPinned('user-id', 'note-id', true)).resolves.toBe(
      true,
    );
    expect(noteRepo.setPinned).toHaveBeenCalledWith('user-id', 'note-id', true);
  });

  it('rejects pinning an inaccessible note', async () => {
    noteRepo.findOne.mockResolvedValue(null);

    await expect(
      service.setPinned('user-id', 'note-id', true),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(noteRepo.setPinned).not.toHaveBeenCalled();
  });

  it('checks ownership before delegating subtree deletion', async () => {
    noteRepo.findOwnedOne.mockResolvedValue(null);

    await expect(service.remove('user-id', 'note-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(noteRepo.remove).not.toHaveBeenCalled();
  });
});
