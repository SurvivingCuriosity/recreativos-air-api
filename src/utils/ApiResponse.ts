export type ApiErrorPayload =
  | string
  | { field: string; message: string }[]
  | Record<string, unknown>;

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error?: ApiErrorPayload;
}

export const ok = <T>(data: T, message = "OK"): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const fail = (
  error: ApiErrorPayload,
  message = "Error",
  statusCode = 500
): ApiResponse<null> & { statusCode: number } => ({
  success: false,
  message,
  data: null,
  error,
  statusCode,
});
