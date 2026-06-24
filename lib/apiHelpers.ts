import { NextResponse } from "next/server";

export type ApiError = {
  error: { code: string; message: string; details?: unknown };
};

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { error: { code, message, ...(details !== undefined ? { details } : {}) } } satisfies ApiError,
    { status },
  );
}

export const jsonBadRequest = (message: string) => jsonError("BAD_REQUEST", message, 400);
export const jsonUnauthorized = (message = "Not signed in") =>
  jsonError("UNAUTHORIZED", message, 401);
export const jsonForbidden = (message = "Forbidden") => jsonError("FORBIDDEN", message, 403);
export const jsonNotFound = (message = "Not found") => jsonError("NOT_FOUND", message, 404);
export const jsonConflict = (message: string) => jsonError("CONFLICT", message, 409);
export const jsonValidationError = (details: unknown) =>
  jsonError("VALIDATION_ERROR", "Invalid input", 422, details);
export const jsonServerError = (message = "Something went wrong") =>
  jsonError("SERVER_ERROR", message, 500);
