import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authAPI } from '@/api/auth';
import { authKeys } from './useAuth';
import type { Session } from '@/types/auth';

// Hook for managing user sessions
export function useSessions() {
  const queryClient = useQueryClient();

  // Get all sessions
  const { 
    data: sessions, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: authKeys.sessions(),
    queryFn: authAPI.getSessions,
    enabled: authAPI.isAuthenticated(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Revoke single session mutation
  const revokeSessionMutation = useMutation({
    mutationFn: authAPI.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
      toast.success('Session revoked successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke session');
    },
  });

  // Revoke all sessions mutation
  const revokeAllSessionsMutation = useMutation({
    mutationFn: authAPI.revokeAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
      toast.success('All sessions revoked successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke all sessions');
    },
  });

  const revokeSession = (sessionId: string) => {
    revokeSessionMutation.mutate(sessionId);
  };

  const revokeAllSessions = () => {
    revokeAllSessionsMutation.mutate();
  };

  return {
    sessions: sessions || [],
    isLoading,
    error,
    revokeSession,
    revokeAllSessions,
    isRevokingSession: revokeSessionMutation.isPending,
    isRevokingAllSessions: revokeAllSessionsMutation.isPending,
  };
}

// Hook for SSO providers
export function useSSOProviders() {
  const { 
    data: providers, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: authKeys.ssoProviders(),
    queryFn: authAPI.getSSOProviders,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const initiateSSOMutation = useMutation({
    mutationFn: authAPI.initiateSSO,
    onSuccess: (data) => {
      // Redirect to SSO provider
      window.location.href = data.redirectUrl;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to initiate SSO');
    },
  });

  const initiateSSO = (providerId: string) => {
    initiateSSOMutation.mutate(providerId);
  };

  return {
    providers: providers?.providers || [],
    isLoading,
    error,
    initiateSSO,
    isInitiatingSSO: initiateSSOMutation.isPending,
  };
}