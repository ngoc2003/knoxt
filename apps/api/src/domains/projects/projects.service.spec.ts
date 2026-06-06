import { ProjectsService } from './projects.service';
import { IProjectRepository } from './application/ports/project.repository';
import { FinanceService } from '../finance/finance.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { NotificationType, ProjectRole } from '../../core/common/enum/enums';
import { NotificationsService } from '../notifications/notifications.service';

describe('ProjectsService invitations', () => {
  const projectRepo = {
    findOne: jest.fn(),
    findUserByEmail: jest.fn(),
    createInvitation: jest.fn(),
  } as unknown as jest.Mocked<IProjectRepository>;
  const mailService = {
    sendProjectInvitation: jest.fn(),
  } as unknown as jest.Mocked<MailService>;
  const notificationsService = {
    create: jest.fn(),
  } as unknown as jest.Mocked<NotificationsService>;
  const service = new ProjectsService(
    projectRepo,
    {} as FinanceService,
    mailService,
    notificationsService,
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

  it('notifies a registered user when they are added to a project', async () => {
    projectRepo.findOne.mockResolvedValue({
      id: 'project-id',
      userId: 'owner-id',
      name: 'Website redesign',
      user: { name: 'Owner' },
      members: [],
    } as never);
    projectRepo.findUserByEmail.mockResolvedValue({
      id: 'member-id',
    } as never);
    projectRepo.addMember = jest.fn().mockResolvedValue({
      userId: 'member-id',
      role: ProjectRole.editor,
    });

    await service.addMember('owner-id', {
      projectId: 'project-id',
      email: 'member@example.com',
      role: ProjectRole.editor,
    });

    expect(notificationsService.create).toHaveBeenCalledWith(
      'member-id',
      NotificationType.projectMemberAdded,
      'You were added to "Website redesign" as editor.',
    );
  });
});
