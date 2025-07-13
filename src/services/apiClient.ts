import { supabase } from './supabase';

/**
 * Cliente API para comunicação com o backend usando autenticação JWT
 */
class ApiClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  /**
   * Obtém o token JWT do usuário atual
   */
  private async getAuthToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  /**
   * Configura os headers com autenticação JWT
   */
  private async getHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Requisição GET
   */
  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${await response.text()}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Requisição POST
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${await response.text()}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Requisição PUT
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${await response.text()}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Requisição PATCH
   */
  async patch<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${await response.text()}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Requisição DELETE
   */
  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${await response.text()}`);
    }

    return response.json() as Promise<T>;
  }
}

// Exporta uma instância única do cliente API
export const apiClient = new ApiClient();

export default apiClient;
