import { ForbiddenException } from '@nestjs/common';
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
    remove: jest.fn(),
    reorderColumns: jest.fn(),
    deleteColumn: jest.fn(),
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

  it('only allows the project owner to reorder columns', async () => {
    projectRepo.findOne.mockResolvedValue({
      id: 'project-id',
      userId: 'owner-id',
      columns: [{ id: 'column-id' }],
      members: [],
      invitations: [],
    } as never);

    await expect(
      service.reorderColumns('editor-id', {
        projectId: 'project-id',
        columnIds: ['column-id'],
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(projectRepo.reorderColumns).not.toHaveBeenCalled();
  });

  it('notifies every member when the owner deletes a project', async () => {
    projectRepo.findOne.mockResolvedValue({
      id: 'project-id',
      userId: 'owner-id',
      name: 'Website redesign',
      members: [{ userId: 'member-one' }, { userId: 'member-two' }],
      invitations: [],
    } as never);
    projectRepo.remove.mockResolvedValue({ id: 'project-id' } as never);

    await service.remove('owner-id', 'project-id');

    expect(notificationsService.create).toHaveBeenCalledTimes(2);
    expect(notificationsService.create).toHaveBeenCalledWith(
      'member-one',
      NotificationType.projectDeleted,
      'The project "Website redesign" was deleted.',
    );
  });

  it('does not allow deleting the last project column', async () => {
    projectRepo.findOne.mockResolvedValue({
      id: 'project-id',
      userId: 'owner-id',
      columns: [{ id: 'column-id' }],
      members: [],
      invitations: [],
    } as never);

    await expect(
      service.deleteColumn('owner-id', {
        projectId: 'project-id',
        columnId: 'column-id',
      }),
    ).rejects.toThrow('A project must have at least one column');

    expect(projectRepo.deleteColumn).not.toHaveBeenCalled();
  });
});
