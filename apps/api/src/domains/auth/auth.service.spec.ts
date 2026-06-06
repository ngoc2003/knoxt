import { JwtService } from '@nestjs/jwt';
import { IAuthRepository } from './application/ports/auth.repository';
import { AuthService } from './auth.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../core/common/enum/enums';

describe('AuthService invitation acceptance', () => {
  const authRepo = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    claimProjectInvitations: jest.fn(),
  } as unknown as jest.Mocked<IAuthRepository>;
  const jwt = {
    sign: jest.fn().mockReturnValue('token'),
  } as unknown as JwtService;
  const notificationsService = {
    create: jest.fn(),
  } as unknown as jest.Mocked<NotificationsService>;
  const service = new AuthService(authRepo, jwt, notificationsService);

  beforeEach(() => jest.clearAllMocks());

  it('claims pending project invitations after registration', async () => {
    authRepo.findByEmail.mockResolvedValue(null);
    authRepo.createUser.mockResolvedValue({
      id: 'user-id',
      email: 'invited@example.com',
      name: 'Invited User',
      passwordHash: 'hash',
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    await service.register({
      email: 'Invited@Example.com',
      name: 'Invited User',
      password: 'password123',
      invitationToken: 'invitation-token',
    });

    expect(authRepo.claimProjectInvitations).toHaveBeenCalledWith(
      'user-id',
      'invited@example.com',
      'invitation-token',
    );
    expect(notificationsService.create).toHaveBeenCalledWith(
      'user-id',
      NotificationType.welcome,
      'Welcome to TaskIO, Invited User!',
    );
  });
});
