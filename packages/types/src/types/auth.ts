export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
  invitationToken?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
