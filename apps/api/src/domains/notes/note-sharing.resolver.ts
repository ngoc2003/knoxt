import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/common/guards/gql-auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../../core/common/decorators/current-user.decorator';
import { Note } from './note.model';
import {
  NoteAttachment,
  NotePublicLinkResult,
  NoteShare,
  NoteTag,
  NoteWorkspaceMeta,
  PublicNoteResult,
} from './note-sharing.model';
import { NoteSharingService } from './note-sharing.service';
import {
  AddNoteAttachmentInput,
  CreateNotePublicLinkInput,
  SetNoteTagsInput,
  ShareNoteInput,
} from './dto/note-sharing.dto';

@Resolver()
@UseGuards(GqlAuthGuard)
export class NoteSharingResolver {
  constructor(private readonly sharingService: NoteSharingService) {}

  @Query(() => NoteWorkspaceMeta)
  noteWorkspaceMeta(
    @CurrentUser() user: AuthUser,
    @Args('noteId') noteId: string,
  ) {
    return this.sharingService.meta(user.id, noteId);
  }

  @Query(() => [Note])
  noteTrash(@CurrentUser() user: AuthUser) {
    return this.sharingService.trash(user.id);
  }

  @Mutation(() => NotePublicLinkResult)
  createNotePublicLink(
    @CurrentUser() user: AuthUser,
    @Args('data') data: CreateNotePublicLinkInput,
  ) {
    return this.sharingService.createPublicLink(user.id, data);
  }

  @Mutation(() => Boolean)
  revokeNotePublicLink(
    @CurrentUser() user: AuthUser,
    @Args('noteId') noteId: string,
  ) {
    return this.sharingService.revokePublicLink(user.id, noteId);
  }

  @Mutation(() => NoteShare)
  shareNoteWithUser(
    @CurrentUser() user: AuthUser,
    @Args('data') data: ShareNoteInput,
  ) {
    return this.sharingService.shareWithUser(user.id, data);
  }

  @Mutation(() => Boolean)
  removeNoteShare(
    @CurrentUser() user: AuthUser,
    @Args('noteId') noteId: string,
    @Args('userId') sharedUserId: string,
  ) {
    return this.sharingService.removeShare(user.id, noteId, sharedUserId);
  }

  @Mutation(() => [NoteTag])
  setNoteTags(
    @CurrentUser() user: AuthUser,
    @Args('data') data: SetNoteTagsInput,
  ) {
    return this.sharingService.setTags(user.id, data);
  }

  @Mutation(() => NoteAttachment)
  addNoteAttachment(
    @CurrentUser() user: AuthUser,
    @Args('data') data: AddNoteAttachmentInput,
  ) {
    return this.sharingService.addAttachment(user.id, data);
  }

  @Mutation(() => NoteAttachment)
  removeNoteAttachment(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.sharingService.removeAttachment(user.id, id);
  }

  @Mutation(() => Note)
  restoreNote(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.sharingService.restore(user.id, id);
  }
}

@Resolver()
export class PublicNoteResolver {
  constructor(private readonly sharingService: NoteSharingService) {}

  @Query(() => PublicNoteResult)
  publicNote(@Args('token') token: string) {
    return this.sharingService.publicNote(token);
  }
}
