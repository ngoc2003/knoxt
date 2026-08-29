import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const MEETING_INTELLIGENCE_PROVIDER =
  'MEETING_INTELLIGENCE_PROVIDER' as const;

export type MeetingIntelligenceProviderInput = {
  title?: string;
  scheduledAt?: Date;
  transcript: string;
};

export type MeetingIntelligenceProviderDraft = {
  title: string;
  summary: string;
  decisions: { title: string; description: string; reason?: string | null }[];
  actionItems: {
    title: string;
    description?: string | null;
    externalAssigneeName?: string | null;
    dueDate?: Date | string | null;
  }[];
  warnings: string[];
};

export interface MeetingIntelligenceProvider {
  analyzeTranscript(
    input: MeetingIntelligenceProviderInput,
  ): Promise<MeetingIntelligenceProviderDraft>;
}

@Injectable()
export class StubMeetingIntelligenceProvider implements MeetingIntelligenceProvider {
  async analyzeTranscript(input: MeetingIntelligenceProviderInput) {
    const lines = input.transcript
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const title = input.title?.trim() || lines[0]?.slice(0, 80) || 'AI recap';
    const decisionLines = lines.filter((line) =>
      /\b(decision|decided|agree|agreed|choose|chosen)\b/i.test(line),
    );
    const actionLines = lines.filter((line) =>
      /\b(action|todo|to do|follow up|send|prepare|book|schedule|need to)\b/i.test(
        line,
      ),
    );

    return {
      title,
      summary: lines.slice(0, 5).join(' '),
      decisions: decisionLines.slice(0, 5).map((line) => ({
        title: line.slice(0, 120),
        description: line,
        reason: null,
      })),
      actionItems: actionLines.slice(0, 8).map((line) => ({
        title: line.replace(/^[-*]\s*/, '').slice(0, 120),
        description: line,
        externalAssigneeName: null,
        dueDate: null,
      })),
      warnings:
        decisionLines.length === 0 && actionLines.length === 0
          ? ['No explicit decisions or action items were detected.']
          : [],
    };
  }
}

@Injectable()
export class OpenAICompatibleMeetingIntelligenceProvider implements MeetingIntelligenceProvider {
  constructor(private readonly config: ConfigService) {}

  async analyzeTranscript(input: MeetingIntelligenceProviderInput) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    const model = this.config.get<string>('AI_MODEL', 'gpt-4o-mini');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Extract a meeting recap as strict JSON. Return exactly these keys: title string, summary string, decisions array of {title, description, reason}, actionItems array of {title, description, externalAssigneeName, dueDate}, warnings string array. Use null for unknown optional fields. Do not include markdown.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              title: input.title,
              scheduledAt: input.scheduledAt,
              transcript: input.transcript,
            }),
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(
        `AI provider request failed (${response.status}): ${await this.errorMessage(response)}`,
      );
    }
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error('AI provider returned an empty response');
    try {
      return JSON.parse(content) as MeetingIntelligenceProviderDraft;
    } catch {
      throw new Error('AI provider returned malformed JSON');
    }
  }

  private async errorMessage(response: Response) {
    try {
      const payload = (await response.json()) as {
        error?: { message?: string; type?: string; code?: string };
      };
      return (
        payload.error?.code ||
        payload.error?.type ||
        payload.error?.message ||
        response.statusText ||
        'Unknown provider error'
      );
    } catch {
      return response.statusText || 'Unknown provider error';
    }
  }
}
