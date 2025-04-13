import { ApiResponse } from '../types/api-response.type';

export function createApiResponse<T>(
  statusCode: number,
  message: string,
  data?: T,
): ApiResponse<T> {
  return {
    statusCode,
    message,
    data,
  };
}
