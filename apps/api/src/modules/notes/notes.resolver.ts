import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { Note } from './note.model';
import { NotePage } from './note-page.model';
import {
  CreateNoteInput,
  ListNotesInput,
  UpdateNoteInput,
} from './dto/note.dto';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { PaginationInput } from '../../common/pagination.dto';

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

  @Query(() => Note)
  noteDetail(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.notesService.findOne(user.id, id);
  }

  @Mutation(() => Note)
  createNote(
    @CurrentUser() user: AuthUser,
    @Args('data') data: CreateNoteInput,
  ) {
    return this.notesService.create(user.id, data);
  }

  @Mutation(() => Note)
  updateNote(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('data') data: UpdateNoteInput,
  ) {
    return this.notesService.update(user.id, id, data);
  }

  @Mutation(() => Note)
  deleteNote(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.notesService.remove(user.id, id);
  }
}
