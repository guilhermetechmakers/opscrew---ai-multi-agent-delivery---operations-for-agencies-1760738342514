import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireEmailVerification?: boolean;
  requireTwoFactor?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireEmailVerification = false,
  requireTwoFactor = false,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthContext();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check email verification requirement
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

  // Check two-factor authentication requirement
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

// Public route component (redirects to dashboard if already authenticated)
interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = '/dashboard' }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

// Role-based route component
interface RoleRouteProps {
  children: ReactNode;
  requiredRole: 'admin' | 'user' | 'viewer';
  fallback?: ReactNode;
}

export function RoleRoute({ children, requiredRole, fallback }: RoleRouteProps) {
  const { user } = useAuthContext();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const roleHierarchy = {
    viewer: 0,
    user: 1,
    admin: 2,
  };
  
  const hasAccess = roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          {fallback || (
            <button 
              onClick={() => window.history.back()}
              className="text-primary hover:text-primary/80 underline"
            >
              Go back
            </button>
          )}
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}