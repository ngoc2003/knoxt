import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { Note, NoteAccess, NoteTreeItem } from './note.model';
import { NotePage } from './note-page.model';
import {
  CreateNoteInput,
  AssignNoteProjectInput,
  ListNotesInput,
  MoveNoteInput,
  UpdateNoteInput,
} from './dto/note.dto';
import { GqlAuthGuard } from '../../core/common/guards/gql-auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../../core/common/decorators/current-user.decorator';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';

@Resolver(() => Note)
@UseGuards(GqlAuthGuard)
export class NotesResolver {
  constructor(private readonly notesService: NotesService) {}

  @Query(() => NotePage)
  notes(
    @CurrentUser() user: AuthUser,
    @Args('filter', { nullable: true }) filter?: ListNotesInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.notesService.findAll(user.id, filter ?? {}, pagination ?? {});
  }

  @Query(() => [NoteTreeItem])
  noteTree(
    @CurrentUser() user: AuthUser,
    @Args('projectId', { nullable: true }) projectId?: string,
    @Args('standaloneOnly', { nullable: true }) standaloneOnly?: boolean,
    @Args('search', { nullable: true }) search?: string,
    @Args('tagIds', { type: () => [String], nullable: true }) tagIds?: string[],
  ) {
    return this.notesService.findTree(
      user.id,
      projectId,
      standaloneOnly,
      search,
      tagIds,
    );
  }

  @Query(() => Note)
  noteDetail(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.notesService.findOne(user.id, id);
  }

  @Query(() => NoteAccess)
  noteAccess(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.notesService.access(user.id, id);
  }

  @Mutation(() => Note)
  createNote(
    @CurrentUser() user: AuthUser,
    @Args('data') data: CreateNoteInput,
  ) {
    return this.notesService.create(user.id, data);
  }

  @Mutation(() => Note)
  assignNoteToProject(
    @CurrentUser() user: AuthUser,
    @Args('data') data: AssignNoteProjectInput,
  ) {
    return this.notesService.assignProject(user.id, data);
  }

  @Mutation(() => Note)
  updateNote(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('data') data: UpdateNoteInput,
  ) {
    return this.notesService.update(user.id, id, data);
  }

  @Mutation(() => Boolean)
  setNotePinned(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('isPinned') isPinned: boolean,
  ) {
    return this.notesService.setPinned(user.id, id, isPinned);
  }

  @Mutation(() => Note)
  moveNote(@CurrentUser() user: AuthUser, @Args('data') data: MoveNoteInput) {
    return this.notesService.move(user.id, data);
  }

  @Mutation(() => Note)
  deleteNote(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.notesService.remove(user.id, id);
  }
}
