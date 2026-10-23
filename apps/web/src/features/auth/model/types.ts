import type { UserProfile } from '@ecommerce/shared-types';

export type AuthUser = Omit<UserProfile, 'createdAt'>;

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
