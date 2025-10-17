# Authentication System Documentation

## Overview

The OpsCrew authentication system provides secure user authentication with JWT tokens, password reset functionality, email verification, and optional two-factor authentication. The system is built with React, TypeScript, and follows modern security best practices.

## Architecture

### Core Components

1. **API Layer** (`src/api/auth.ts`)
   - Centralized authentication API calls
   - Token management and refresh logic
   - Error handling and retry mechanisms

2. **Type Definitions** (`src/types/auth.ts`)
   - TypeScript interfaces for all authentication-related data
   - Request/response types for API calls
   - Error handling types

3. **React Hooks** (`src/hooks/useAuth.ts`, `src/hooks/useSessions.ts`)
   - Custom hooks for authentication state management
   - React Query integration for caching and synchronization
   - Form validation utilities

4. **Context Provider** (`src/contexts/AuthContext.tsx`)
   - Global authentication state management
   - Protected route components
   - Role-based access control

5. **Route Guards** (`src/components/ProtectedRoute.tsx`)
   - Protected route wrapper components
   - Public route redirects
   - Role-based route protection

## Features

### Authentication Methods

- **Email/Password**: Traditional authentication with secure password hashing
- **SSO Integration**: Support for Google, Microsoft, and SAML/OIDC providers
- **Magic Links**: Passwordless authentication via email
- **Two-Factor Authentication**: Optional TOTP and SMS-based 2FA

### Security Features

- **JWT Tokens**: Secure access and refresh token management
- **Password Strength**: Real-time password validation and strength indicators
- **Rate Limiting**: Protection against brute force attacks
- **Session Management**: Device tracking and session revocation
- **Email Verification**: Required email verification for new accounts

### User Experience

- **Form Validation**: Real-time validation with helpful error messages
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages and recovery flows
- **Responsive Design**: Mobile-first design with smooth animations
- **Accessibility**: WCAG compliant with keyboard navigation support

## Usage

### Basic Authentication

```tsx
import { useAuthContext } from '@/contexts/AuthContext';

function LoginComponent() {
  const { login, isLoggingIn, user, isAuthenticated } = useAuthContext();

  const handleLogin = (credentials) => {
    login({
      email: credentials.email,
      password: credentials.password,
      rememberMe: credentials.rememberMe
    });
  };

  if (isAuthenticated) {
    return <div>Welcome, {user?.name}!</div>;
  }

  return (
    <form onSubmit={handleLogin}>
      {/* Login form fields */}
    </form>
  );
}
```

### Protected Routes

```tsx
import { ProtectedRoute, RoleRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <RoleRoute requiredRole="admin">
          <AdminPanel />
        </RoleRoute>
      } />
    </Routes>
  );
}
```

### Password Reset Flow

```tsx
import { useAuthContext } from '@/contexts/AuthContext';

function ForgotPasswordComponent() {
  const { requestPasswordReset } = useAuthContext();

  const handleReset = (email) => {
    requestPasswordReset(email);
  };

  return (
    <form onSubmit={handleReset}>
      {/* Password reset form */}
    </form>
  );
}
```

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/me` - Get current user

### Password Management

- `POST /api/auth/password-reset` - Request password reset
- `POST /api/auth/password-reset/confirm` - Confirm password reset
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email

### Two-Factor Authentication

- `POST /api/auth/2fa/setup` - Setup 2FA
- `POST /api/auth/2fa/confirm` - Confirm 2FA setup
- `POST /api/auth/2fa/verify` - Verify 2FA code

### Session Management

- `GET /api/auth/sessions` - Get user sessions
- `DELETE /api/auth/sessions/:id` - Revoke specific session
- `DELETE /api/auth/sessions` - Revoke all sessions

## Configuration

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=OpsCrew
VITE_APP_VERSION=1.0.0
```

### Token Configuration

```typescript
const AUTH_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  SESSION_TIMEOUT: 15 * 60 * 1000, // 15 minutes
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
};
```

## Security Considerations

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Token Security

- Access tokens stored in memory (not localStorage)
- Refresh tokens stored in HTTP-only cookies
- Automatic token refresh before expiry
- Token revocation on logout

### Rate Limiting

- Login attempts: 5 per 15 minutes
- Password reset: 3 per hour
- Email verification: 5 per hour

## Error Handling

### Common Error Codes

- `INVALID_CREDENTIALS` - Invalid email or password
- `EMAIL_NOT_VERIFIED` - Email address not verified
- `ACCOUNT_LOCKED` - Account temporarily locked
- `TOKEN_EXPIRED` - Authentication token expired
- `RATE_LIMITED` - Too many requests

### Error Recovery

- Automatic token refresh on 401 errors
- Graceful fallback for network errors
- User-friendly error messages
- Retry mechanisms for transient failures

## Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

## Troubleshooting

### Common Issues

1. **Token Expired Errors**
   - Check system clock synchronization
   - Verify token refresh logic
   - Clear browser storage and retry

2. **CORS Issues**
   - Verify API base URL configuration
   - Check server CORS settings
   - Ensure proper headers

3. **Form Validation Errors**
   - Check validation rules
   - Verify input sanitization
   - Test with different browsers

### Debug Mode

Enable debug logging by setting:

```typescript
localStorage.setItem('auth-debug', 'true');
```

## Migration Guide

### From v1 to v2

1. Update import paths
2. Replace deprecated hooks
3. Update route configurations
4. Migrate custom validation logic

### Breaking Changes

- Context API changes
- Hook signature updates
- Route guard modifications
- Error handling improvements

## Contributing

### Development Setup

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Run tests: `npm run test`
4. Build for production: `npm run build`

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write comprehensive tests
- Document all public APIs

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review existing GitHub issues
3. Create a new issue with detailed information
4. Contact the development team

## License

This authentication system is part of the OpsCrew project and follows the same licensing terms.