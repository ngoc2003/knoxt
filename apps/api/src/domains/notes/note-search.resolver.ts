import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/common/guards/gql-auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../../core/common/decorators/current-user.decorator';
import { PaginationInput } from '../../core/common/dtos/pagination.dto';
import { SearchNotesInput } from './dto/note-search.dto';
import { NoteSearchPage } from './note-search.model';
import { NoteSearchService } from './note-search.service';

@Resolver()
@UseGuards(GqlAuthGuard)
export class NoteSearchResolver {
  constructor(private readonly searchService: NoteSearchService) {}

  @Query(() => NoteSearchPage)
  searchNotes(
    @CurrentUser() user: AuthUser,
    @Args('input', { nullable: true }) input?: SearchNotesInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.searchService.search(user.id, input ?? {}, pagination ?? {});
  }
}
