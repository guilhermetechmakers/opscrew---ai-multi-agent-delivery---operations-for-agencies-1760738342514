import type {
  TemplatesResponse,
  ProvidersResponse,
  ProvisioningCreateRequest,
  ProvisioningResponse,
  ProvisioningStatus,
  ProvisioningRequest,
  ProjectTemplate,
  GitProvider,
  DeploymentProvider,
  ProvisioningError
} from '@/types/provisioning';

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// HTTP Client for Provisioning API
class ProvisioningAPI {
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
      console.error('Provisioning API Request failed:', error);
      throw error;
    }
  }

  // Get available project templates
  async getTemplates(): Promise<TemplatesResponse> {
    return await this.request<TemplatesResponse>('/provisioning/templates');
  }

  // Get available providers (Git, Deployment)
  async getProviders(): Promise<ProvidersResponse> {
    return await this.request<ProvidersResponse>('/provisioning/providers');
  }

  // Get user's connected Git repositories
  async getGitRepositories(providerId: string): Promise<GitProvider> {
    return await this.request<GitProvider>(`/provisioning/git-providers/${providerId}/repositories`);
  }

  // Connect Git provider
  async connectGitProvider(providerId: string, credentials: any): Promise<{ success: boolean; message: string }> {
    return await this.request<{ success: boolean; message: string }>(`/provisioning/git-providers/${providerId}/connect`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Connect Deployment provider
  async connectDeploymentProvider(providerId: string, credentials: any): Promise<{ success: boolean; message: string }> {
    return await this.request<{ success: boolean; message: string }>(`/provisioning/deployment-providers/${providerId}/connect`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Create provisioning request
  async createProvisioningRequest(data: ProvisioningCreateRequest): Promise<ProvisioningResponse> {
    return await this.request<ProvisioningResponse>('/provisioning/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get provisioning request status
  async getProvisioningStatus(requestId: string): Promise<ProvisioningStatus> {
    return await this.request<ProvisioningStatus>(`/provisioning/requests/${requestId}/status`);
  }

  // Get provisioning request details
  async getProvisioningRequest(requestId: string): Promise<ProvisioningRequest> {
    return await this.request<ProvisioningRequest>(`/provisioning/requests/${requestId}`);
  }

  // Cancel provisioning request
  async cancelProvisioningRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    return await this.request<{ success: boolean; message: string }>(`/provisioning/requests/${requestId}/cancel`, {
      method: 'POST',
    });
  }

  // Retry failed provisioning step
  async retryProvisioningStep(requestId: string, stepId: string): Promise<{ success: boolean; message: string }> {
    return await this.request<{ success: boolean; message: string }>(`/provisioning/requests/${requestId}/steps/${stepId}/retry`, {
      method: 'POST',
    });
  }

  // Get provisioning logs
  async getProvisioningLogs(requestId: string, stepId?: string): Promise<any[]> {
    const endpoint = stepId 
      ? `/provisioning/requests/${requestId}/steps/${stepId}/logs`
      : `/provisioning/requests/${requestId}/logs`;
    return await this.request<any[]>(endpoint);
  }

  // Validate repository name availability
  async validateRepositoryName(providerId: string, repositoryName: string): Promise<{ available: boolean; message?: string }> {
    return await this.request<{ available: boolean; message?: string }>(`/provisioning/validate/repository-name`, {
      method: 'POST',
      body: JSON.stringify({ providerId, repositoryName }),
    });
  }

  // Validate domain availability
  async validateDomain(domain: string): Promise<{ available: boolean; message?: string }> {
    return await this.request<{ available: boolean; message?: string }>(`/provisioning/validate/domain`, {
      method: 'POST',
      body: JSON.stringify({ domain }),
    });
  }

  // Get deployment regions
  async getDeploymentRegions(providerId: string): Promise<{ regions: Array<{ id: string; name: string; location: string }> }> {
    return await this.request<{ regions: Array<{ id: string; name: string; location: string }> }>(`/provisioning/deployment-providers/${providerId}/regions`);
  }

  // Get deployment plans
  async getDeploymentPlans(providerId: string): Promise<{ plans: Array<{ id: string; name: string; price: number; features: string[] }> }> {
    return await this.request<{ plans: Array<{ id: string; name: string; price: number; features: string[] }> }>(`/provisioning/deployment-providers/${providerId}/plans`);
  }

  // Test webhook URL
  async testWebhook(url: string): Promise<{ success: boolean; message: string }> {
    return await this.request<{ success: boolean; message: string }>('/provisioning/test/webhook', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // Get organization's provisioning history
  async getProvisioningHistory(limit?: number, offset?: number): Promise<{ requests: ProvisioningRequest[]; total: number }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return await this.request<{ requests: ProvisioningRequest[]; total: number }>(`/provisioning/history?${params.toString()}`);
  }

  // Delete provisioning request (if not started)
  async deleteProvisioningRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    return await this.request<{ success: boolean; message: string }>(`/provisioning/requests/${requestId}`, {
      method: 'DELETE',
    });
  }

  // Update access token (called when auth token is refreshed)
  setAccessToken(token: string): void {
    this.accessToken = token;
  }
}

// Create singleton instance
export const provisioningAPI = new ProvisioningAPI(API_BASE_URL);

// Export individual methods for convenience
export const {
  getTemplates,
  getProviders,
  getGitRepositories,
  connectGitProvider,
  connectDeploymentProvider,
  createProvisioningRequest,
  getProvisioningStatus,
  getProvisioningRequest,
  cancelProvisioningRequest,
  retryProvisioningStep,
  getProvisioningLogs,
  validateRepositoryName,
  validateDomain,
  getDeploymentRegions,
  getDeploymentPlans,
  testWebhook,
  getProvisioningHistory,
  deleteProvisioningRequest,
  setAccessToken
} = provisioningAPI;