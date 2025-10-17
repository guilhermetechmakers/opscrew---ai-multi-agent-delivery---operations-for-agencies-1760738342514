import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authAPI } from '@/api/auth';
import type { 
  LoginRequest, 
  SignupRequest, 
  PasswordResetRequest, 
  PasswordResetConfirmRequest,
  TwoFactorSetupRequest,
  TwoFactorVerifyRequest,
  User,
  AuthResponse,
  AuthState,
  AuthError
} from '@/types/auth';

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  sessions: () => [...authKeys.all, 'sessions'] as const,
  ssoProviders: () => [...authKeys.all, 'sso-providers'] as const,
};

// Custom hook for authentication state
export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get current user
  const { 
    data: user, 
    isLoading: isLoadingUser, 
    error: userError 
  } = useQuery({
    queryKey: authKeys.user(),
    queryFn: authAPI.getCurrentUser,
    enabled: authAPI.isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data: AuthResponse) => {
      queryClient.setQueryData(authKeys.user(), data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: authAPI.signup,
    onSuccess: (data: AuthResponse) => {
      queryClient.setQueryData(authKeys.user(), data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Signup failed');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate('/login');
    },
    onError: (error: Error) => {
      // Clear local state even if API call fails
      queryClient.clear();
      toast.error('Logout failed, but you have been signed out locally');
      navigate('/login');
    },
  });

  // Password reset request mutation
  const passwordResetMutation = useMutation({
    mutationFn: authAPI.requestPasswordReset,
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send password reset email');
    },
  });

  // Password reset confirm mutation
  const passwordResetConfirmMutation = useMutation({
    mutationFn: authAPI.confirmPasswordReset,
    onSuccess: () => {
      toast.success('Password reset successfully');
      navigate('/login');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Password reset failed');
    },
  });

  // Email verification mutation
  const emailVerificationMutation = useMutation({
    mutationFn: authAPI.verifyEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      toast.success('Email verified successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Email verification failed');
    },
  });

  // Resend verification email mutation
  const resendVerificationMutation = useMutation({
    mutationFn: authAPI.resendVerificationEmail,
    onSuccess: () => {
      toast.success('Verification email sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send verification email');
    },
  });

  // Two-factor setup mutation
  const twoFactorSetupMutation = useMutation({
    mutationFn: authAPI.setupTwoFactor,
    onSuccess: () => {
      toast.success('Two-factor authentication setup initiated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to setup two-factor authentication');
    },
  });

  // Two-factor confirm mutation
  const twoFactorConfirmMutation = useMutation({
    mutationFn: authAPI.confirmTwoFactorSetup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      toast.success('Two-factor authentication enabled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm two-factor authentication');
    },
  });

  // Two-factor verify mutation
  const twoFactorVerifyMutation = useMutation({
    mutationFn: authAPI.verifyTwoFactor,
    onSuccess: (data: AuthResponse) => {
      queryClient.setQueryData(authKeys.user(), data.user);
      toast.success('Two-factor authentication verified');
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Two-factor verification failed');
    },
  });

  // Helper functions
  const login = (credentials: LoginRequest) => {
    loginMutation.mutate(credentials);
  };

  const signup = (userData: SignupRequest) => {
    signupMutation.mutate(userData);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const requestPasswordReset = (email: string) => {
    passwordResetMutation.mutate(email);
  };

  const confirmPasswordReset = (data: PasswordResetConfirmRequest) => {
    passwordResetConfirmMutation.mutate(data);
  };

  const verifyEmail = (token: string) => {
    emailVerificationMutation.mutate(token);
  };

  const resendVerification = () => {
    resendVerificationMutation.mutate();
  };

  const setupTwoFactor = () => {
    twoFactorSetupMutation.mutate();
  };

  const confirmTwoFactor = (data: TwoFactorSetupRequest) => {
    twoFactorConfirmMutation.mutate(data);
  };

  const verifyTwoFactor = (code: string) => {
    twoFactorVerifyMutation.mutate(code);
  };

  // Computed state
  const isAuthenticated = !!user && authAPI.isAuthenticated();
  const isLoading = isLoadingUser || 
    loginMutation.isPending || 
    signupMutation.isPending || 
    logoutMutation.isPending;

  const error: AuthError | null = userError ? {
    message: userError.message,
    code: 'USER_FETCH_ERROR'
  } : null;

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    signup,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    verifyEmail,
    resendVerification,
    setupTwoFactor,
    confirmTwoFactor,
    verifyTwoFactor,
    
    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isResettingPassword: passwordResetMutation.isPending,
    isConfirmingPasswordReset: passwordResetConfirmMutation.isPending,
    isVerifyingEmail: emailVerificationMutation.isPending,
    isResendingVerification: resendVerificationMutation.isPending,
    isSettingUpTwoFactor: twoFactorSetupMutation.isPending,
    isConfirmingTwoFactor: twoFactorConfirmMutation.isPending,
    isVerifyingTwoFactor: twoFactorVerifyMutation.isPending,
  };
}

// Hook for password strength validation
export function usePasswordStrength() {
  const calculateStrength = (password: string) => {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add uppercase letters');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add lowercase letters');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add numbers');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add special characters');
    }

    return {
      score: Math.min(score, 4),
      feedback,
      isValid: score >= 3 && password.length >= 8
    };
  };

  return { calculateStrength };
}

// Hook for form validation
export function useFormValidation() {
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/\d/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true };
  };

  const validateName = (name: string): { isValid: boolean; message?: string } => {
    if (name.trim().length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters long' };
    }
    return { isValid: true };
  };

  return {
    validateEmail,
    validatePassword,
    validateName,
  };
}