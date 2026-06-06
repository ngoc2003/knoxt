import type { AiSession, AiMessage } from 'database/generated/client';

export type AiSessionWithMessages = AiSession & { messages: AiMessage[] };

export interface IAiRepository {
  createSession(userId: string, title?: string): Promise<AiSessionWithMessages>;
  findSessions(userId: string): Promise<AiSessionWithMessages[]>;
  findSession(
    userId: string,
    id: string,
  ): Promise<AiSessionWithMessages | null>;
  createMessage(
    sessionId: string,
    role: string,
    content: string,
  ): Promise<AiMessage>;
  updateSessionTimestamp(id: string): Promise<AiSession>;
  deleteSession(id: string): Promise<AiSession>;
}
