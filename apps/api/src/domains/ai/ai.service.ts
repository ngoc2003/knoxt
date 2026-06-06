import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AI_REPOSITORY } from '../../core/constants/repository.tokens';
import type { IAiRepository } from './application/ports/ai.repository';
import { CreateAiSessionInput, SendAiMessageInput } from './dto/ai.dto';

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_REPOSITORY)
    private readonly aiRepo: IAiRepository,
  ) {}

  async createSession(userId: string, data: CreateAiSessionInput) {
    return this.aiRepo.createSession(userId, data.title);
  }

  async findSessions(userId: string) {
    return this.aiRepo.findSessions(userId);
  }

  async findSession(userId: string, id: string) {
    const session = await this.aiRepo.findSession(userId, id);
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async sendMessage(userId: string, input: SendAiMessageInput) {
    const session = await this.findSession(userId, input.sessionId);

    await this.aiRepo.createMessage(session.id, 'user', input.content);

    // Stub AI reply — replace with real AI integration later
    const assistantReply = await this.aiRepo.createMessage(
      session.id,
      'assistant',
      `(AI) Received: "${input.content}"`,
    );

    await this.aiRepo.updateSessionTimestamp(session.id);

    return assistantReply;
  }

  async deleteSession(userId: string, id: string) {
    await this.findSession(userId, id);
    return this.aiRepo.deleteSession(id);
  }
}
