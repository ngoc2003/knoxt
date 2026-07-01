import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { User } from 'database/generated/client';
import { IAuthRepository } from './application/ports/auth.repository';
import { AuthService } from './auth.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../core/common/enum/enums';

describe('AuthService invitation acceptance', () => {
  const authRepo = {
    findByEmail: jest.fn(),
    findByGoogleSubject: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    claimProjectInvitations: jest.fn(),
  } as unknown as jest.Mocked<IAuthRepository>;
  const jwt = {
    sign: jest.fn().mockReturnValue('token'),
  } as unknown as JwtService;
  const notificationsService = {
    create: jest.fn(),
  } as unknown as jest.Mocked<NotificationsService>;
  const configService = {
    getOrThrow: jest.fn().mockReturnValue('google-client-id'),
  } as unknown as jest.Mocked<ConfigService>;
  const service = new AuthService(
    authRepo,
    jwt,
    notificationsService,
    configService,
  );

  const createUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-id',
      email: 'person@example.com',
      name: 'Test Person',
      passwordHash: 'hash',
      googleSubject: null,
      avatarUrl: null,
      createdAt: new Date('2026-06-09T00:00:00.000Z'),
      updatedAt: new Date('2026-06-09T00:00:00.000Z'),
      deletedAt: null,
      ...overrides,
    }) as User;

  const mockGooglePayload = (
    payload: Record<string, unknown>,
  ): jest.SpyInstance =>
    jest
      .spyOn(
        service as unknown as {
          verifyGoogleCredential: (
            credential: string,
          ) => Promise<Record<string, unknown>>;
        },
        'verifyGoogleCredential',
      )
      .mockResolvedValue(payload);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('claims pending project invitations after registration', async () => {
    authRepo.findByEmail.mockResolvedValue(null);
    authRepo.createUser.mockResolvedValue(
      createUser({
        email: 'invited@example.com',
        name: 'Invited User',
        passwordHash: 'hash',
      }),
    );

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

  it('creates a new OAuth user and claims invitations during Google login', async () => {
    mockGooglePayload({
      sub: 'google-subject',
      email: 'NewPerson@Example.com',
      email_verified: true,
      name: 'New Person',
      picture: 'https://example.com/avatar.png',
    });
    authRepo.findByGoogleSubject.mockResolvedValue(null);
    authRepo.findByEmail.mockResolvedValue(null);
    authRepo.createUser.mockResolvedValue(
      createUser({
        email: 'newperson@example.com',
        name: 'New Person',
        passwordHash: null,
        googleSubject: 'google-subject',
        avatarUrl: 'https://example.com/avatar.png',
      }),
    );

    const result = await service.loginWithGoogle({
      credential: 'google-token',
      invitationToken: 'invitation-token',
    });

    expect(authRepo.createUser).toHaveBeenCalledWith({
      email: 'newperson@example.com',
      name: 'New Person',
      passwordHash: null,
      googleSubject: 'google-subject',
      avatarUrl: 'https://example.com/avatar.png',
    });
    expect(authRepo.claimProjectInvitations).toHaveBeenCalledWith(
      'user-id',
      'newperson@example.com',
      'invitation-token',
    );
    expect(notificationsService.create).toHaveBeenCalledWith(
      'user-id',
      NotificationType.welcome,
      'Welcome to TaskIO, New Person!',
    );
    expect(result.accessToken).toBe('token');
  });

  it('links an existing email user to Google without replacing their name', async () => {
    const existingUser = createUser({
      id: 'existing-user',
      email: 'person@example.com',
      name: 'Local Name',
      avatarUrl: null,
    });
    const linkedUser = createUser({
      ...existingUser,
      googleSubject: 'google-subject',
      avatarUrl: 'https://example.com/avatar.png',
    });
    mockGooglePayload({
      sub: 'google-subject',
      email: 'person@example.com',
      email_verified: true,
      name: 'Google Name',
      picture: 'https://example.com/avatar.png',
    });
    authRepo.findByGoogleSubject.mockResolvedValue(null);
    authRepo.findByEmail.mockResolvedValue(existingUser);
    authRepo.updateUser.mockResolvedValue(linkedUser);

    const result = await service.loginWithGoogle({
      credential: 'google-token',
      invitationToken: 'invitation-token',
    });

    expect(authRepo.updateUser).toHaveBeenCalledWith('existing-user', {
      googleSubject: 'google-subject',
      avatarUrl: 'https://example.com/avatar.png',
    });
    expect(authRepo.createUser).not.toHaveBeenCalled();
    expect(authRepo.claimProjectInvitations).toHaveBeenCalledWith(
      'existing-user',
      'person@example.com',
      'invitation-token',
    );
    expect(result.user.name).toBe('Local Name');
  });

  it('signs in returning Google users by Google subject', async () => {
    const user = createUser({ googleSubject: 'google-subject' });
    mockGooglePayload({
      sub: 'google-subject',
      email: 'person@example.com',
      email_verified: true,
    });
    authRepo.findByGoogleSubject.mockResolvedValue(user);

    const result = await service.loginWithGoogle({
      credential: 'google-token',
    });

    expect(authRepo.findByEmail).not.toHaveBeenCalled();
    expect(authRepo.updateUser).not.toHaveBeenCalled();
    expect(result.user.email).toBe('person@example.com');
  });

  it('rejects invalid Google payloads', async () => {
    mockGooglePayload({
      sub: 'google-subject',
      email: 'person@example.com',
      email_verified: false,
    });

    await expect(
      service.loginWithGoogle({ credential: 'google-token' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects password login for OAuth-only accounts', async () => {
    authRepo.findByEmail.mockResolvedValue(
      createUser({ passwordHash: null, googleSubject: 'google-subject' }),
    );

    await expect(
      service.login({ email: 'person@example.com', password: 'password123' }),
    ).rejects.toThrow('Invalid email or password');
  });
});
