import { ProjectsService } from './projects.service';
import { IProjectRepository } from './application/ports/project.repository';
import { FinanceService } from '../finance/finance.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { ProjectRole } from '../../core/common/enum/enums';

describe('ProjectsService invitations', () => {
  const projectRepo = {
    findOne: jest.fn(),
    findUserByEmail: jest.fn(),
    createInvitation: jest.fn(),
  } as unknown as jest.Mocked<IProjectRepository>;
  const mailService = {
    sendProjectInvitation: jest.fn(),
  } as unknown as jest.Mocked<MailService>;
  const service = new ProjectsService(
    projectRepo,
    {} as FinanceService,
    mailService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('creates and emails an invitation when the user is not registered', async () => {
    projectRepo.findOne.mockResolvedValue({
      id: 'project-id',
      userId: 'owner-id',
      name: 'Website redesign',
      user: { name: 'Owner' },
      members: [],
    } as never);
    projectRepo.findUserByEmail.mockResolvedValue(null);
    projectRepo.createInvitation.mockResolvedValue({
      id: 'invitation-id',
      email: 'new@example.com',
      role: ProjectRole.editor,
      token: 'invitation-token',
    } as never);
    mailService.sendProjectInvitation.mockResolvedValue(true);

    await expect(
      service.addMember('owner-id', {
        projectId: 'project-id',
        email: 'new@example.com',
        role: ProjectRole.editor,
      }),
    ).resolves.toMatchObject({
      status: 'invitation-sent',
      emailSent: true,
    });

    expect(mailService.sendProjectInvitation).toHaveBeenCalledWith({
      email: 'new@example.com',
      inviterName: 'Owner',
      projectId: 'project-id',
      projectName: 'Website redesign',
      role: ProjectRole.editor,
      token: 'invitation-token',
    });
  });
});
