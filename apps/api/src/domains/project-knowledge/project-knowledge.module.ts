import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProjectKnowledgeResolver } from './project-knowledge.resolver';
import { ProjectKnowledgeService } from './project-knowledge.service';
import {
  MEETING_INTELLIGENCE_PROVIDER,
  OpenAICompatibleMeetingIntelligenceProvider,
  StubMeetingIntelligenceProvider,
} from './meeting-intelligence.provider';

@Module({
  providers: [
    ProjectKnowledgeResolver,
    ProjectKnowledgeService,
    {
      provide: MEETING_INTELLIGENCE_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        config.get<string>('AI_PROVIDER', 'stub') === 'openai'
          ? new OpenAICompatibleMeetingIntelligenceProvider(config)
          : new StubMeetingIntelligenceProvider(),
    },
  ],
})
export class ProjectKnowledgeModule {}
