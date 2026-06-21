import type { User } from 'database/generated/client';

export interface IAuthRepository {
  findByEmail(email: string): Promise<User | null>;
  findByGoogleSubject(googleSubject: string): Promise<User | null>;
  createUser(data: {
    email: string;
    name: string;
    passwordHash: string | null;
    googleSubject?: string | null;
    avatarUrl?: string | null;
  }): Promise<User>;
  updateUser(
    id: string,
    data: {
      googleSubject?: string | null;
      avatarUrl?: string | null;
    },
  ): Promise<User>;
  claimProjectInvitations(
    userId: string,
    email: string,
    token?: string,
  ): Promise<void>;
}
