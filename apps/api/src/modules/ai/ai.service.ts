import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAiSessionInput, SendAiMessageInput } from './dto/ai.dto';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string, data: CreateAiSessionInput) {
    return this.prisma.aiSession.create({
      data: { userId, title: data.title },
      include: { messages: true },
    });
  }

  async findSessions(userId: string) {
    return this.prisma.aiSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async findSession(userId: string, id: string) {
    const session = await this.prisma.aiSession.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async sendMessage(userId: string, input: SendAiMessageInput) {
    const session = await this.findSession(userId, input.sessionId);

    // Save the user message
    await this.prisma.aiMessage.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: input.content,
      },
    });

    // Stub AI reply — replace with real AI integration later
    const assistantReply = await this.prisma.aiMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: `(AI) Received: "${input.content}"`,
      },
    });

    // Update session timestamp
    await this.prisma.aiSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    return assistantReply;
  }

  async deleteSession(userId: string, id: string) {
    await this.findSession(userId, id);
    return this.prisma.aiSession.delete({ where: { id } });
  }
}
