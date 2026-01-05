import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';
import type { ApiResponse } from '@/types';

/**
 * Configured Axios instance for API calls
 * Handles:
 * - Request/response interceptors
 * - Authentication token injection
 * - Error standardization
 * - Retry logic
 */
class ApiClient {
  private axiosInstance: AxiosInstance;
  private retryCount = 3;
  private retryDelay = 1000;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const session = await getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response.data,
      async (error) => {
        const config = error.config;

        // Handle 401 - token expired
        if (error.response?.status === 401 && !config._retry) {
          config._retry = true;
          // TODO: Implement token refresh logic with next-auth
        }

        // Retry logic for 5xx and network errors
        if (
          config._retryCount < this.retryCount &&
          (error.response?.status >= 500 || !error.response)
        ) {
          config._retryCount = (config._retryCount || 0) + 1;
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelay * config._retryCount)
          );
          return this.axiosInstance(config);
        }

        return this.handleError(error);
      }
    );
  }

  private handleError(error: any): Promise<never> {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'An error occurred';
    const code = error.response?.data?.error?.code || 'UNKNOWN_ERROR';
    const statusCode = error.response?.status || 500;

    const apiError = {
      code,
      message,
      statusCode,
      details: error.response?.data?.error?.details,
    };

    return Promise.reject(apiError);
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.get<ApiResponse<T>>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) {
    return this.axiosInstance.post<ApiResponse<T>>(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) {
    return this.axiosInstance.put<ApiResponse<T>>(url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) {
    return this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.delete<ApiResponse<T>>(url, config);
  }
}

export const apiClient = new ApiClient();
