import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type {
  IAiRepository,
  AiSessionWithMessages,
} from '../application/ports/ai.repository';

@Injectable()
export class PrismaAiRepository implements IAiRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string, title?: string) {
    return this.prisma.aiSession.create({
      data: { userId, title: title ?? 'New Session' },
      include: { messages: true },
    }) as Promise<AiSessionWithMessages>;
  }

  async findSessions(userId: string) {
    return this.prisma.aiSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    }) as Promise<AiSessionWithMessages[]>;
  }

  async findSession(userId: string, id: string) {
    return this.prisma.aiSession.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    }) as Promise<AiSessionWithMessages | null>;
  }

  async createMessage(sessionId: string, role: string, content: string) {
    return this.prisma.aiMessage.create({
      data: { sessionId, role, content },
    });
  }

  async updateSessionTimestamp(id: string) {
    return this.prisma.aiSession.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }

  async deleteSession(id: string) {
    return this.prisma.aiSession.delete({ where: { id } });
  }
}
