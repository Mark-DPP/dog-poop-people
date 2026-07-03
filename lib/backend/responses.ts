import "server-only";

import { NextResponse } from "next/server";

import { normalizeError } from "@/lib/backend/errors";

type SuccessResponse<T> = {
  ok: true;
  data: T;
};

type ErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function successResponse<T>(
  data: T,
  init?: ResponseInit,
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      ok: true,
      data,
    },
    init,
  );
}

export function createdResponse<T>(data: T): NextResponse<SuccessResponse<T>> {
  return successResponse(data, { status: 201 });
}

export function emptyResponse(init?: ResponseInit): NextResponse {
  return new NextResponse(null, init ?? { status: 204 });
}

export function errorResponse(error: unknown): NextResponse<ErrorResponse> {
  const normalizedError = normalizeError(error);

  return NextResponse.json(
    {
      ok: false,
      error: {
        code: normalizedError.code,
        message: normalizedError.expose
          ? normalizedError.message
          : "Something went wrong",
        ...(normalizedError.details ? { details: normalizedError.details } : {}),
      },
    },
    { status: normalizedError.status },
  );
}

