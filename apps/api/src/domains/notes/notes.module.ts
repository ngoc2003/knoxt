import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesResolver } from './notes.resolver';
import { PrismaNoteRepository } from './infrastructure/prisma-note.repository';
import { NOTE_REPOSITORY } from '../../core/constants/repository.tokens';

@Module({
  providers: [
    NotesResolver,
    NotesService,
    {
      provide: NOTE_REPOSITORY,
      useClass: PrismaNoteRepository,
    },
  ],
  exports: [NotesService],
})
export class NotesModule {}
