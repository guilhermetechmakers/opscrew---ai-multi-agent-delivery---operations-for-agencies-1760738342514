// Authentication utilities and helpers
import { authAPI } from '@/api/auth';
import type { User, AuthError } from '@/types/auth';

// Token management utilities
export const tokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  },

  getTokenExpiration: (token: string): Date | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }
};

// Session management utilities
export const sessionManager = {
  getSessionData: (): { user: User | null; isAuthenticated: boolean } => {
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();
    
    if (!accessToken || !refreshToken) {
      return { user: null, isAuthenticated: false };
    }

    if (tokenManager.isTokenExpired(accessToken)) {
      // Token is expired, try to refresh
      return { user: null, isAuthenticated: false };
    }

    // Parse user data from token (in a real app, this would come from the API)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return {
        user: payload.user || null,
        isAuthenticated: true
      };
    } catch {
      return { user: null, isAuthenticated: false };
    }
  },

  clearSession: (): void => {
    tokenManager.clearTokens();
    // Clear any other session data
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
  }
};

// Authentication state utilities
export const authUtils = {
  isAuthenticated: (): boolean => {
    return authAPI.isAuthenticated();
  },

  getCurrentUser: (): User | null => {
    const { user } = sessionManager.getSessionData();
    return user;
  },

  hasRole: (user: User | null, requiredRole: 'admin' | 'user' | 'viewer'): boolean => {
    if (!user) return false;
    
    const roleHierarchy = {
      viewer: 0,
      user: 1,
      admin: 2,
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  },

  canAccess: (user: User | null, resource: string): boolean => {
    if (!user) return false;
    
    // Define access rules based on user role
    const accessRules = {
      admin: ['*'], // Admin can access everything
      user: ['dashboard', 'projects', 'settings', 'profile'],
      viewer: ['dashboard', 'profile']
    };
    
    const userRules = accessRules[user.role] || [];
    return userRules.includes('*') || userRules.includes(resource);
  }
};

// Error handling utilities
export const authErrorHandler = {
  parseError: (error: unknown): AuthError => {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'AUTH_ERROR'
      };
    }
    
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return {
        message: (error as any).message,
        code: (error as any).code || 'AUTH_ERROR'
      };
    }
    
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    };
  },

  isNetworkError: (error: unknown): boolean => {
    return error instanceof Error && (
      error.message.includes('Network Error') ||
      error.message.includes('fetch') ||
      error.message.includes('Failed to fetch')
    );
  },

  isAuthError: (error: unknown): boolean => {
    return error instanceof Error && (
      error.message.includes('401') ||
      error.message.includes('403') ||
      error.message.includes('Unauthorized') ||
      error.message.includes('Forbidden')
    );
  }
};

// Form validation utilities
export const formValidation = {
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  validateName: (name: string): { isValid: boolean; error?: string } => {
    if (name.trim().length < 2) {
      return { isValid: false, error: 'Name must be at least 2 characters long' };
    }
    
    if (name.trim().length > 50) {
      return { isValid: false, error: 'Name must be less than 50 characters' };
    }
    
    return { isValid: true };
  }
};

// URL utilities for authentication flows
export const authUrls = {
  getLoginUrl: (redirectTo?: string): string => {
    const baseUrl = '/login';
    return redirectTo ? `${baseUrl}?redirect=${encodeURIComponent(redirectTo)}` : baseUrl;
  },

  getSignupUrl: (): string => {
    return '/signup';
  },

  getForgotPasswordUrl: (): string => {
    return '/forgot-password';
  },

  getResetPasswordUrl: (token: string): string => {
    return `/reset-password?token=${encodeURIComponent(token)}`;
  },

  getEmailVerificationUrl: (token: string): string => {
    return `/verify-email?token=${encodeURIComponent(token)}`;
  },

  getDashboardUrl: (): string => {
    return '/dashboard';
  }
};

// Constants
export const AUTH_CONSTANTS = {
  TOKEN_STORAGE_KEY: 'accessToken',
  REFRESH_TOKEN_STORAGE_KEY: 'refreshToken',
  USER_STORAGE_KEY: 'user',
  SESSION_TIMEOUT: 15 * 60 * 1000, // 15 minutes
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;