import { Injectable, Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../../core/constants/repository.tokens';
import type { IUserRepository } from './application/ports/user.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
  ) {}

  findById(id: string) {
    return this.userRepo.findById(id);
  }

  async updateProfile(id: string, data: { name?: string; avatarUrl?: string }) {
    return this.userRepo.updateProfile(id, data);
  }
}
