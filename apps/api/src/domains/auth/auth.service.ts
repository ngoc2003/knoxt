import {
  ConflictException,
  Injectable,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import { AUTH_REPOSITORY } from '../../core/constants/repository.tokens';
import type { IAuthRepository } from './application/ports/auth.repository';
import {
  RegisterInput,
  LoginInput,
  AuthResponse,
  GoogleLoginInput,
} from './dto/auth.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../core/common/enum/enums';

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepo: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async register(data: RegisterInput): Promise<AuthResponse> {
    const email = data.email.toLowerCase();
    const existing = await this.authRepo.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.authRepo.createUser({
      email,
      name: data.name,
      passwordHash,
    });
    await this.authRepo.claimProjectInvitations(
      user.id,
      user.email,
      data.invitationToken,
    );
    await this.notificationsService.create(
      user.id,
      NotificationType.welcome,
      `Welcome to TaskIO, ${user.name}!`,
    );

    return this.buildAuthResponse(user);
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await this.authRepo.findByEmail(data.email.toLowerCase());
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async loginWithGoogle(data: GoogleLoginInput): Promise<AuthResponse> {
    const payload = await this.verifyGoogleCredential(data.credential);
    const googleSubject = payload.sub;
    const email = payload.email?.toLowerCase();

    if (!googleSubject || !email || payload.email_verified !== true) {
      throw new UnauthorizedException('Invalid Google credential');
    }

    const existingByGoogle =
      await this.authRepo.findByGoogleSubject(googleSubject);
    if (existingByGoogle) {
      await this.authRepo.claimProjectInvitations(
        existingByGoogle.id,
        existingByGoogle.email,
        data.invitationToken,
      );
      return this.buildAuthResponse(existingByGoogle);
    }

    const existingByEmail = await this.authRepo.findByEmail(email);
    if (existingByEmail) {
      if (
        existingByEmail.googleSubject &&
        existingByEmail.googleSubject !== googleSubject
      ) {
        throw new UnauthorizedException('Invalid Google credential');
      }

      const user = await this.authRepo.updateUser(existingByEmail.id, {
        googleSubject,
        avatarUrl: existingByEmail.avatarUrl ?? payload.picture ?? null,
      });
      await this.authRepo.claimProjectInvitations(
        user.id,
        user.email,
        data.invitationToken,
      );
      return this.buildAuthResponse(user);
    }

    const user = await this.authRepo.createUser({
      email,
      name: payload.name?.trim() || email,
      passwordHash: null,
      googleSubject,
      avatarUrl: payload.picture ?? null,
    });
    await this.authRepo.claimProjectInvitations(
      user.id,
      user.email,
      data.invitationToken,
    );
    await this.notificationsService.create(
      user.id,
      NotificationType.welcome,
      `Welcome to TaskIO, ${user.name}!`,
    );

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): AuthResponse {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  private async verifyGoogleCredential(
    credential: string,
  ): Promise<TokenPayload> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google credential');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid Google credential');
    }
  }
}
