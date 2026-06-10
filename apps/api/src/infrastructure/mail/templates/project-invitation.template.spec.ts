import { renderProjectInvitationTemplate } from './project-invitation.template';

describe('renderProjectInvitationTemplate', () => {
  it('renders invitation details and escapes dynamic values', () => {
    const html = renderProjectInvitationTemplate({
      inviterName: '<script>alert("inviter")</script>',
      projectName: 'Website & Mobile',
      registerUrl:
        'https://knoxt.test/register?email=user@example.com&role=member',
      role: 'Editor',
    });

    expect(html).toContain(
      '&lt;script&gt;alert(&quot;inviter&quot;)&lt;/script&gt;',
    );
    expect(html).toContain('Website &amp; Mobile');
    expect(html).toContain(
      'https://knoxt.test/register?email=user@example.com&amp;role=member',
    );
    expect(html).toContain('Editor');
    expect(html).not.toContain('<script>alert("inviter")</script>');
  });
});
