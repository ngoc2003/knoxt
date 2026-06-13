import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesResolver } from './notes.resolver';
import { PrismaNoteRepository } from './infrastructure/prisma-note.repository';
import { NOTE_REPOSITORY } from '../../core/constants/repository.tokens';
import {
  NoteSharingResolver,
  PublicNoteResolver,
} from './note-sharing.resolver';
import { NoteSharingService } from './note-sharing.service';
import { AuthorizationModule } from '../../core/authorization/authorization.module';
import { NoteSearchResolver } from './note-search.resolver';
import { NoteSearchService } from './note-search.service';

@Module({
  imports: [AuthorizationModule],
  providers: [
    NotesResolver,
    NoteSharingResolver,
    PublicNoteResolver,
    NoteSearchResolver,
    NotesService,
    NoteSharingService,
    NoteSearchService,
    {
      provide: NOTE_REPOSITORY,
      useClass: PrismaNoteRepository,
    },
  ],
  exports: [NotesService],
})
export class NotesModule {}
