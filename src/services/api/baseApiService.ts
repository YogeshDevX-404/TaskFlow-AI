import { axiosInstance } from './axiosInstance';
import { AxiosRequestConfig } from 'axios';

export interface ApiResponseData<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  timestamp: string;
}

export class BaseApiService {
  protected static async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponseData<T>> {
    const response = await axiosInstance.get<ApiResponseData<T>>(url, config);
    return response.data;
  }

  protected static async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponseData<T>> {
    const response = await axiosInstance.post<ApiResponseData<T>>(url, data, config);
    return response.data;
  }

  protected static async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponseData<T>> {
    const response = await axiosInstance.put<ApiResponseData<T>>(url, data, config);
    return response.data;
  }

  protected static async patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponseData<T>> {
    const response = await axiosInstance.patch<ApiResponseData<T>>(url, data, config);
    return response.data;
  }

  protected static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponseData<T>> {
    const response = await axiosInstance.delete<ApiResponseData<T>>(url, config);
    return response.data;
  }
}
