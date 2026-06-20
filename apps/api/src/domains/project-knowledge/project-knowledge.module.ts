import { Module } from '@nestjs/common';
import { ProjectKnowledgeResolver } from './project-knowledge.resolver';
import { ProjectKnowledgeService } from './project-knowledge.service';

@Module({
  providers: [ProjectKnowledgeResolver, ProjectKnowledgeService],
})
export class ProjectKnowledgeModule {}
