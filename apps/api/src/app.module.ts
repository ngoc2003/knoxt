import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './domains/auth/auth.module';
import { UsersModule } from './domains/users/users.module';
import { CustomersModule } from './domains/customers/customers.module';
import { ProjectsModule } from './domains/projects/projects.module';
import { TasksModule } from './domains/tasks/tasks.module';
import { NotesModule } from './domains/notes/notes.module';
import { AiModule } from './domains/ai/ai.module';
import { VoyagerController } from './infrastructure/graphql/voyager.controller';
import { formatGraphQLError } from './infrastructure/graphql/format-error';
import { AuthorizationModule } from './core/authorization/authorization.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { NotificationsModule } from './domains/notifications/notifications.module';
import { validateEnvironment } from './config/env.validation';
import { HealthModule } from './infrastructure/health/health.module';
import { LoggingModule } from './infrastructure/logging/logging.module';
import { ProjectKnowledgeModule } from './domains/project-knowledge/project-knowledge.module';

@Module({
  controllers: [VoyagerController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    LoggingModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile:
        process.env.NODE_ENV === 'production'
          ? true
          : join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req }: { req: Request }) => ({ req }),
      formatError: formatGraphQLError,
    }),
    PrismaModule,
    HealthModule,
    AuthorizationModule,
    MailModule,
    NotificationsModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    ProjectsModule,
    TasksModule,
    NotesModule,
    ProjectKnowledgeModule,
    AiModule,
  ],
})
export class AppModule {}
