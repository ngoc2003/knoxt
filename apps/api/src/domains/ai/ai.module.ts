import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiResolver } from './ai.resolver';
import { PrismaAiRepository } from './infrastructure/prisma-ai.repository';
import { AI_REPOSITORY } from '../../core/constants/repository.tokens';

@Module({
  providers: [
    AiResolver,
    AiService,
    {
      provide: AI_REPOSITORY,
      useClass: PrismaAiRepository,
    },
  ],
})
export class AiModule {}
