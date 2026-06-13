import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { NOTE_REPOSITORY } from '../../core/constants/repository.tokens';
import type { INoteRepository } from './application/ports/note.repository';
import {
  CreateNoteInput,
  AssignNoteProjectInput,
  ListNotesInput,
  MoveNoteInput,
  UpdateNoteInput,
} from './dto/note.dto';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';
import { ProjectAuthorizationService } from '../../core/authorization/project-authorization.service';
import { Permission } from '../../core/common/enum/enums';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class NotesService {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepo: INoteRepository,
    private readonly projectAuthorization: ProjectAuthorizationService,
  ) {}

  async create(userId: string, data: CreateNoteInput) {
    if (data.projectId) {
      await this.projectAuthorization.assertPermission(
        userId,
        data.projectId,
        Permission.projectEdit,
      );
    }
    await this.ensureParent(userId, data.projectId ?? null, data.parentId);
    await this.ensureCustomer(userId, data.customerId);
    return this.noteRepo.create(userId, data);
  }

  async findAll(
    userId: string,
    filter: ListNotesInput,
    pagination: PaginationInput,
  ) {
    if (filter.projectId) {
      await this.projectAuthorization.assertPermission(
        userId,
        filter.projectId,
        Permission.projectRead,
      );
    }
    return this.noteRepo.findAll(userId, filter, pagination);
  }

  async findTree(
    userId: string,
    projectId?: string,
    standaloneOnly?: boolean,
    search?: string,
    tagIds?: string[],
  ) {
    if (projectId) {
      await this.projectAuthorization.assertPermission(
        userId,
        projectId,
        Permission.projectRead,
      );
    }
    return this.noteRepo.findTree(
      userId,
      projectId,
      standaloneOnly,
      search,
      tagIds,
    );
  }

  async findOne(userId: string, id: string) {
    const note = await this.noteRepo.findOne(userId, id);
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async access(userId: string, id: string) {
    const note = await this.findOne(userId, id);
    if (!note.projectId) {
      return {
        canEdit: Boolean(
          await this.noteRepo.findStandaloneEditable(userId, note.id),
        ),
        canShare: note.userId === userId,
      };
    }

    return {
      canEdit: await this.hasProjectPermission(
        userId,
        note.projectId,
        Permission.projectEdit,
      ),
      canShare: await this.hasProjectPermission(
        userId,
        note.projectId,
        Permission.projectManageMembers,
      ),
    };
  }

  async update(userId: string, id: string, data: UpdateNoteInput) {
    const existing = await this.findOne(userId, id);
    await this.assertEditable(userId, existing);
    await this.ensureCustomer(userId, data.customerId);
    const note = await this.noteRepo.update(userId, id, data);
    if (!note) {
      throw new ConflictException(
        'Note changed since it was loaded. Refresh before saving again.',
      );
    }
    return note;
  }

  async assignProject(userId: string, data: AssignNoteProjectInput) {
    const existing = await this.findOne(userId, data.noteId);
    await this.assertEditable(userId, existing);
    const targetProjectId = data.projectId ?? null;
    if (targetProjectId === existing.projectId) return existing;
    if (targetProjectId) {
      await this.projectAuthorization.assertPermission(
        userId,
        targetProjectId,
        Permission.projectEdit,
      );
    }
    return this.noteRepo.assignProject(userId, {
      noteId: data.noteId,
      projectId: targetProjectId,
    });
  }

  async setPinned(userId: string, id: string, isPinned: boolean) {
    await this.findOne(userId, id);
    return this.noteRepo.setPinned(userId, id, isPinned);
  }

  async move(userId: string, data: MoveNoteInput) {
    const note = await this.findOne(userId, data.id);
    await this.assertEditable(userId, note);
    await this.ensureParent(userId, note.projectId, data.parentId);

    if (data.parentId === data.id) {
      throw new BadRequestException('A note cannot be its own parent');
    }
    if (
      data.parentId &&
      (await this.noteRepo.isDescendant(note.projectId, data.id, data.parentId))
    ) {
      throw new BadRequestException('A note cannot move into its descendant');
    }

    const siblingIds = (
      await this.noteRepo.findSiblings(userId, note.projectId, data.parentId)
    )
      .map((note) => note.id)
      .filter((id) => id !== data.id);
    const expectedIds = [...siblingIds, data.id].sort();
    const orderedIds = [...new Set(data.orderedSiblingIds)].sort();
    if (
      orderedIds.length !== data.orderedSiblingIds.length ||
      orderedIds.length !== expectedIds.length ||
      orderedIds.some((id, index) => id !== expectedIds[index])
    ) {
      throw new BadRequestException(
        'orderedSiblingIds must contain every destination sibling exactly once',
      );
    }

    return this.noteRepo.move(userId, note.projectId, data);
  }

  async remove(userId: string, id: string) {
    const note = await this.findOne(userId, id);
    await this.assertEditable(userId, note);
    return this.noteRepo.remove(userId, note.projectId, id);
  }

  private async ensureParent(
    userId: string,
    projectId: string | null,
    parentId?: string | null,
  ) {
    if (!parentId) return;
    const parent = await this.noteRepo.findInScope(userId, projectId, parentId);
    if (!parent) throw new BadRequestException('Parent note not found');
  }

  private async ensureCustomer(userId: string, customerId?: string | null) {
    if (!customerId) return;
    if (!(await this.noteRepo.customerExists(userId, customerId))) {
      throw new BadRequestException('Customer not found');
    }
  }

  private async assertEditable(
    userId: string,
    note: { id: string; projectId: string | null },
  ) {
    if (note.projectId) {
      await this.projectAuthorization.assertPermission(
        userId,
        note.projectId,
        Permission.projectEdit,
      );
      return;
    }
    if (!(await this.noteRepo.findStandaloneEditable(userId, note.id))) {
      throw new NotFoundException('Note not found');
    }
  }

  private async hasProjectPermission(
    userId: string,
    projectId: string,
    permission: Permission,
  ) {
    try {
      await this.projectAuthorization.assertPermission(
        userId,
        projectId,
        permission,
      );
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) return false;
      throw error;
    }
  }
}
