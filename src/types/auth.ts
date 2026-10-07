export type UserRole = 'ADMIN' | 'USER';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  isVerified: boolean; // Auto-verified upon sign up
  createdAt: string; // ISO 8601
  lastLoginAt?: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}
