import type { 
  AuthResponse, 
  LoginRequest, 
  SignupRequest, 
  PasswordResetRequest, 
  PasswordResetConfirmRequest,
  EmailVerificationRequest,
  RefreshTokenRequest,
  TwoFactorSetupRequest,
  TwoFactorVerifyRequest,
  User,
  Session
} from '@/types/auth';

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// HTTP Client with interceptors
class AuthAPI {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage() {
    this.accessToken = localStorage.getItem('accessToken');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication Endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store tokens securely
    this.accessToken = response.accessToken;
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    return response;
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store tokens securely
    this.accessToken = response.accessToken;
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Clear tokens regardless of API response
      this.accessToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    // Update stored tokens
    this.accessToken = response.accessToken;
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return await this.request<User>('/auth/me');
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.request('/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<void> {
    await this.request('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(token: string): Promise<void> {
    await this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerificationEmail(): Promise<void> {
    await this.request('/auth/resend-verification', {
      method: 'POST',
    });
  }

  async setupTwoFactor(): Promise<{ secret: string; qrCode: string }> {
    return await this.request<{ secret: string; qrCode: string }>('/auth/2fa/setup', {
      method: 'POST',
    });
  }

  async confirmTwoFactorSetup(data: TwoFactorSetupRequest): Promise<void> {
    await this.request('/auth/2fa/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyTwoFactor(code: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });

    // Store tokens after 2FA verification
    this.accessToken = response.accessToken;
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    return response;
  }

  async getSessions(): Promise<Session[]> {
    return await this.request<Session[]>('/auth/sessions');
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.request(`/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async revokeAllSessions(): Promise<void> {
    await this.request('/auth/sessions', {
      method: 'DELETE',
    });
  }

  // SSO Methods
  async getSSOProviders(): Promise<{ providers: Array<{ id: string; name: string; url: string }> }> {
    return await this.request<{ providers: Array<{ id: string; name: string; url: string }> }>('/auth/sso/providers');
  }

  async initiateSSO(providerId: string): Promise<{ redirectUrl: string }> {
    return await this.request<{ redirectUrl: string }>(`/auth/sso/${providerId}`, {
      method: 'POST',
    });
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }
}

// Create singleton instance
export const authAPI = new AuthAPI(API_BASE_URL);

// Export individual methods for convenience
export const {
  login,
  signup,
  logout,
  refreshToken,
  getCurrentUser,
  requestPasswordReset,
  confirmPasswordReset,
  verifyEmail,
  resendVerificationEmail,
  setupTwoFactor,
  confirmTwoFactorSetup,
  verifyTwoFactor,
  getSessions,
  revokeSession,
  revokeAllSessions,
  getSSOProviders,
  initiateSSO,
  isAuthenticated,
  getAccessToken,
  setAccessToken
} = authAPI;