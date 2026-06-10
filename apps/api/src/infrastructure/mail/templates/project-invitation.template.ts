export interface ProjectInvitationTemplateInput {
  inviterName: string;
  projectName: string;
  registerUrl: string;
  role: string;
}

export function renderProjectInvitationTemplate(
  input: ProjectInvitationTemplateInput,
) {
  const inviterName = escapeHtml(input.inviterName);
  const projectName = escapeHtml(input.projectName);
  const role = escapeHtml(input.role);
  const invitationUrl = escapeHtml(input.registerUrl);

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Project invitation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; color: #0f172a; font-family: Arial, Helvetica, sans-serif;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
          ${inviterName} invited you to collaborate on ${projectName}.
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9;">
          <tr>
            <td align="center" style="padding: 40px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px;">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <span style="display: inline-block; color: #4f46e5; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                      Knoxt.io
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="overflow: hidden; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="height: 6px; background-color: #4f46e5; font-size: 0; line-height: 0;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td style="padding: 44px 48px 40px;">
                          <div style="margin-bottom: 24px;">
                            <span style="display: inline-block; padding: 7px 12px; background-color: #eef2ff; border-radius: 999px; color: #4338ca; font-size: 12px; font-weight: 700; letter-spacing: 0.7px; text-transform: uppercase;">
                              Project invitation
                            </span>
                          </div>
                          <h1 style="margin: 0 0 16px; color: #0f172a; font-size: 30px; line-height: 1.25; letter-spacing: -0.7px;">
                            You have been invited to collaborate
                          </h1>
                          <p style="margin: 0 0 28px; color: #475569; font-size: 16px; line-height: 1.7;">
                            <strong style="color: #0f172a;">${inviterName}</strong> invited you to join
                            <strong style="color: #0f172a;">${projectName}</strong>.
                          </p>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
                            <tr>
                              <td style="padding: 18px 20px;">
                                <p style="margin: 0 0 5px; color: #64748b; font-size: 12px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase;">
                                  Your role
                                </p>
                                <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 700;">
                                  ${role}
                                </p>
                              </td>
                            </tr>
                          </table>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td align="center" bgcolor="#4f46e5" style="border-radius: 10px;">
                                <a href="${invitationUrl}" target="_blank" style="display: inline-block; padding: 15px 24px; color: #ffffff; font-size: 15px; font-weight: 700; line-height: 1; text-decoration: none;">
                                  Accept invitation
                                </a>
                              </td>
                            </tr>
                          </table>
                          <p style="margin: 32px 0 8px; color: #64748b; font-size: 13px; line-height: 1.6;">
                            If the button does not work, paste this link into your browser:
                          </p>
                          <p style="margin: 0; color: #4f46e5; font-size: 13px; line-height: 1.6; word-break: break-all;">
                            <a href="${invitationUrl}" target="_blank" style="color: #4f46e5; text-decoration: underline;">${invitationUrl}</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 24px 20px 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                    You received this email because ${inviterName} invited you to a project on Knoxt.io.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]!,
  );
}
