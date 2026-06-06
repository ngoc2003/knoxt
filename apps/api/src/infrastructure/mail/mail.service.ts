import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { renderProjectInvitationTemplate } from './templates/project-invitation.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendProjectInvitation(input: {
    email: string;
    inviterName: string;
    projectId: string;
    projectName: string;
    role: string;
    token: string;
  }) {
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    if (!user || !pass) {
      this.logger.warn(
        `Project invitation for ${input.email} was saved, but SMTP_USER/SMTP_PASS are not configured`,
      );
      return false;
    }

    const webUrl = this.config.get<string>('WEB_URL', 'http://localhost:5173');
    const registerUrl = `${webUrl}/register?email=${encodeURIComponent(input.email)}&invitation=${encodeURIComponent(input.token)}&project=${encodeURIComponent(input.projectId)}`;
    const invitationHtml = renderProjectInvitationTemplate({
      inviterName: input.inviterName,
      projectName: input.projectName,
      registerUrl,
      role: input.role,
    });
    const transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('SMTP_PORT', 465),
      secure: this.config.get<string>('SMTP_SECURE', 'true') === 'true',
      auth: { user, pass },
    });

    try {
      await transporter.sendMail({
        from: this.config.get<string>('SMTP_FROM', user),
        to: input.email,
        subject: `${input.inviterName} invited you to ${input.projectName}`,
        text: `${input.inviterName} invited you to collaborate on "${input.projectName}" as ${input.role}. Register at ${registerUrl}`,
        html: invitationHtml,
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send project invitation to ${input.email}`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }
}
