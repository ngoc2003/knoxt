import type { User } from 'database/generated/client';

export interface IAuthRepository {
  findByEmail(email: string): Promise<User | null>;
  createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
  }): Promise<User>;
  claimProjectInvitations(
    userId: string,
    email: string,
    token?: string,
  ): Promise<void>;
}
