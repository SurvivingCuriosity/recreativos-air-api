import { ApiErrorPayload } from "./ApiResponse";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public payload?: ApiErrorPayload,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
