import type { User } from 'database/generated/client';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  updateProfile(
    id: string,
    data: { name?: string; avatarUrl?: string },
  ): Promise<User>;
}
