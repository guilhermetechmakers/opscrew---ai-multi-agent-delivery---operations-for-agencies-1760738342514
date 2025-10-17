// Authentication Types for OpsCrew
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  organizationId: string;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  organizationName?: string;
  acceptTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TwoFactorSetupRequest {
  secret: string;
  code: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
}

export interface AuthError {
  message: string;
  code: string;
  field?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

export interface SSOProvider {
  id: string;
  name: string;
  icon: string;
  url: string;
  enabled: boolean;
}

export interface Session {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    browser: string;
  };
  ipAddress: string;
  lastActiveAt: string;
  createdAt: string;
  isActive: boolean;
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export interface AuthConfig {
  enableSSO: boolean;
  enableTwoFactor: boolean;
  enableMagicLink: boolean;
  passwordMinLength: number;
  sessionTimeout: number; // in minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
}