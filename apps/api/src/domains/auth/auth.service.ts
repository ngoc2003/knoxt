import {
  ConflictException,
  Injectable,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AUTH_REPOSITORY } from '../../core/constants/repository.tokens';
import type { IAuthRepository } from './application/ports/auth.repository';
import { RegisterInput, LoginInput, AuthResponse } from './dto/auth.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../core/common/enum/enums';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepo: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
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
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const passwordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

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
}
