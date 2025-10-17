import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import type { User, AuthState } from '@/types/auth';

// Create Query Client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error instanceof Error && error.message.includes('401')) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// Auth Context Type
interface AuthContextType extends AuthState {
  // Actions
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => void;
  signup: (userData: { name: string; email: string; password: string; organizationName?: string; acceptTerms: boolean }) => void;
  logout: () => void;
  requestPasswordReset: (email: string) => void;
  confirmPasswordReset: (data: { token: string; password: string; confirmPassword: string }) => void;
  verifyEmail: (token: string) => void;
  resendVerification: () => void;
  setupTwoFactor: () => void;
  confirmTwoFactor: (data: { secret: string; code: string }) => void;
  verifyTwoFactor: (code: string) => void;
  
  // Mutation states
  isLoggingIn: boolean;
  isSigningUp: boolean;
  isLoggingOut: boolean;
  isResettingPassword: boolean;
  isConfirmingPasswordReset: boolean;
  isVerifyingEmail: boolean;
  isResendingVerification: boolean;
  isSettingUpTwoFactor: boolean;
  isConfirmingTwoFactor: boolean;
  isVerifyingTwoFactor: boolean;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  // Auto-refresh token on app start
  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken && !auth.isAuthenticated) {
      // Try to refresh token silently
      auth.refreshToken?.().catch(() => {
        // If refresh fails, clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });
    }
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        await auth.refreshToken?.();
      } catch (error) {
        console.error('Token refresh failed:', error);
        // If refresh fails, logout user
        auth.logout();
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes

    return () => clearInterval(refreshInterval);
  }, [auth.isAuthenticated]);

  const contextValue: AuthContextType = {
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    
    // Actions
    login: auth.login,
    signup: auth.signup,
    logout: auth.logout,
    requestPasswordReset: auth.requestPasswordReset,
    confirmPasswordReset: auth.confirmPasswordReset,
    verifyEmail: auth.verifyEmail,
    resendVerification: auth.resendVerification,
    setupTwoFactor: auth.setupTwoFactor,
    confirmTwoFactor: auth.confirmTwoFactor,
    verifyTwoFactor: auth.verifyTwoFactor,
    
    // Mutation states
    isLoggingIn: auth.isLoggingIn,
    isSigningUp: auth.isSigningUp,
    isLoggingOut: auth.isLoggingOut,
    isResettingPassword: auth.isResettingPassword,
    isConfirmingPasswordReset: auth.isConfirmingPasswordReset,
    isVerifyingEmail: auth.isVerifyingEmail,
    isResendingVerification: auth.isResendingVerification,
    isSettingUpTwoFactor: auth.isSettingUpTwoFactor,
    isConfirmingTwoFactor: auth.isConfirmingTwoFactor,
    isVerifyingTwoFactor: auth.isVerifyingTwoFactor,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

// Hook to use Auth Context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireEmailVerification?: boolean;
  requireTwoFactor?: boolean;
}

export function ProtectedRoute({ 
  children, 
  fallback = null,
  requireEmailVerification = false,
  requireTwoFactor = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  if (requireEmailVerification && user && !user.isEmailVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Email Verification Required
            </h1>
            <p className="text-muted-foreground">
              Please check your email and verify your account to continue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (requireTwoFactor && user && !user.isTwoFactorEnabled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Two-Factor Authentication Required
            </h1>
            <p className="text-muted-foreground">
              Please enable two-factor authentication to continue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook for role-based access control
export function useRoleAccess(requiredRole: 'admin' | 'user' | 'viewer') {
  const { user } = useAuthContext();
  
  if (!user) return false;
  
  const roleHierarchy = {
    viewer: 0,
    user: 1,
    admin: 2,
  };
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

// Component for role-based rendering
interface RoleGuardProps {
  children: ReactNode;
  requiredRole: 'admin' | 'user' | 'viewer';
  fallback?: ReactNode;
}

export function RoleGuard({ children, requiredRole, fallback = null }: RoleGuardProps) {
  const hasAccess = useRoleAccess(requiredRole);
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}