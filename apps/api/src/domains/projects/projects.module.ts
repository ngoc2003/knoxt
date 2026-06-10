import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsResolver } from './projects.resolver';
import { PrismaProjectRepository } from './infrastructure/prisma-project.repository';
import { PROJECT_REPOSITORY } from '../../core/constants/repository.tokens';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [
    ProjectsResolver,
    ProjectsService,
    {
      provide: PROJECT_REPOSITORY,
      useClass: PrismaProjectRepository,
    },
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
