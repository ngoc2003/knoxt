import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksResolver } from './tasks.resolver';
import { PrismaTaskRepository } from './infrastructure/prisma-task.repository';
import { TASK_REPOSITORY } from '../../core/constants/repository.tokens';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [
    TasksResolver,
    TasksService,
    {
      provide: TASK_REPOSITORY,
      useClass: PrismaTaskRepository,
    },
  ],
  exports: [TasksService],
})
export class TasksModule {}
