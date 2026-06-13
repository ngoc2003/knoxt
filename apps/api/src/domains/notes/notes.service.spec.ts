import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { INoteRepository } from './application/ports/note.repository';
import { NotesService } from './notes.service';

describe('NotesService tree rules', () => {
  const noteRepo = {
    create: jest.fn(),
    findOne: jest.fn(),
    findInScope: jest.fn(),
    findStandaloneEditable: jest.fn(),
    customerExists: jest.fn(),
    update: jest.fn(),
    assignProject: jest.fn(),
    setPinned: jest.fn(),
    findSiblings: jest.fn(),
    isDescendant: jest.fn(),
    move: jest.fn(),
    remove: jest.fn(),
  } as unknown as jest.Mocked<INoteRepository>;
  const projectAuthorization = {
    assertPermission: jest.fn(),
  };
  const service = new NotesService(noteRepo, projectAuthorization as never);

  beforeEach(() => jest.clearAllMocks());

  it('creates a standalone note without requiring project permission', async () => {
    noteRepo.create.mockResolvedValue({ id: 'note-id' } as never);

    await service.create('user-id', { title: 'Standalone' });

    expect(projectAuthorization.assertPermission).not.toHaveBeenCalled();
    expect(noteRepo.create).toHaveBeenCalledWith('user-id', {
      title: 'Standalone',
    });
  });

  it('allows a standalone owner to edit and share their note', async () => {
    noteRepo.findOne.mockResolvedValue({
      id: 'note-id',
      userId: 'user-id',
      projectId: null,
    } as never);
    noteRepo.findStandaloneEditable.mockResolvedValue({
      id: 'note-id',
    } as never);

    await expect(service.access('user-id', 'note-id')).resolves.toEqual({
      canEdit: true,
      canShare: true,
    });
  });

  it('returns read-only access for a project viewer', async () => {
    noteRepo.findOne.mockResolvedValue({
      id: 'note-id',
      userId: 'owner-id',
      projectId: 'project-id',
    } as never);
    projectAuthorization.assertPermission
      .mockRejectedValueOnce(new ForbiddenException())
      .mockRejectedValueOnce(new ForbiddenException());

    await expect(service.access('viewer-id', 'note-id')).resolves.toEqual({
      canEdit: false,
      canShare: false,
    });
  });

  it('rejects creating a note under an inaccessible parent', async () => {
    noteRepo.findInScope.mockResolvedValue(null);

    await expect(
      service.create('user-id', {
        title: 'Child',
        projectId: 'project-id',
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
        projectId: 'project-id',
        customerId: 'customer-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(noteRepo.create).not.toHaveBeenCalled();
  });

  it('rejects moving a note into one of its descendants', async () => {
    noteRepo.findOne.mockResolvedValue({
      id: 'note-id',
      projectId: 'project-id',
    } as never);
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
    noteRepo.findOne.mockResolvedValue({
      id: 'note-id',
      projectId: 'project-id',
    } as never);
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
    noteRepo.findOne.mockResolvedValue({
      id: 'note-id',
      projectId: 'project-id',
    } as never);
    noteRepo.findSiblings.mockResolvedValue([
      { id: 'sibling-one' },
      { id: 'sibling-two' },
    ] as never);
    noteRepo.move.mockResolvedValue({ id: 'note-id' } as never);

    await service.move('user-id', {
      id: 'note-id',
      orderedSiblingIds: ['sibling-two', 'note-id', 'sibling-one'],
    });

    expect(noteRepo.move).toHaveBeenCalledWith('user-id', 'project-id', {
      id: 'note-id',
      orderedSiblingIds: ['sibling-two', 'note-id', 'sibling-one'],
    });
  });

  it('returns a conflict instead of overwriting a stale note version', async () => {
    noteRepo.findOne.mockResolvedValue({
      id: 'note-id',
      projectId: 'project-id',
    } as never);
    noteRepo.update.mockResolvedValue(null);

    await expect(
      service.update('user-id', 'note-id', {
        title: 'Stale title',
        expectedVersion: 2,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('checks destination project edit permission before assigning a subtree', async () => {
    noteRepo.findOne.mockResolvedValue({
      id: 'note-id',
      userId: 'user-id',
      projectId: null,
    } as never);
    noteRepo.findStandaloneEditable.mockResolvedValue({
      id: 'note-id',
    } as never);
    noteRepo.assignProject.mockResolvedValue({
      id: 'note-id',
      projectId: 'project-id',
    } as never);

    await service.assignProject('user-id', {
      noteId: 'note-id',
      projectId: 'project-id',
    });

    expect(projectAuthorization.assertPermission).toHaveBeenCalledWith(
      'user-id',
      'project-id',
      'project.edit',
    );
    expect(noteRepo.assignProject).toHaveBeenCalledWith('user-id', {
      noteId: 'note-id',
      projectId: 'project-id',
    });
  });

  it('allows an accessible note to be pinned for the current user', async () => {
    noteRepo.findOne.mockResolvedValue({
      id: 'note-id',
      projectId: 'project-id',
    } as never);
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
    noteRepo.findOne.mockResolvedValue(null);

    await expect(service.remove('user-id', 'note-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(noteRepo.remove).not.toHaveBeenCalled();
  });
});
