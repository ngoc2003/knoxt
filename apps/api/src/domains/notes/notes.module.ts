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

@Module({
  providers: [
    NotesResolver,
    NoteSharingResolver,
    PublicNoteResolver,
    NotesService,
    NoteSharingService,
    {
      provide: NOTE_REPOSITORY,
      useClass: PrismaNoteRepository,
    },
  ],
  exports: [NotesService],
})
export class NotesModule {}
