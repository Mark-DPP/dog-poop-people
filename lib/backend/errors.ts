import "server-only";

import { Prisma } from "@/lib/generated/prisma/client";
import { ZodError } from "zod";

export type ErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "DATABASE_ERROR"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;
  readonly expose: boolean;

  constructor({
    message,
    code,
    status,
    details,
    expose = true,
  }: {
    message: string;
    code: ErrorCode;
    status: number;
    details?: unknown;
    expose?: boolean;
  }) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.expose = expose;
  }
}

export function badRequest(message = "Bad request", details?: unknown) {
  return new AppError({
    message,
    code: "BAD_REQUEST",
    status: 400,
    details,
  });
}

export function unauthorized(message = "Unauthorized") {
  return new AppError({
    message,
    code: "UNAUTHORIZED",
    status: 401,
  });
}

export function forbidden(message = "Forbidden") {
  return new AppError({
    message,
    code: "FORBIDDEN",
    status: 403,
  });
}

export function notFound(message = "Not found") {
  return new AppError({
    message,
    code: "NOT_FOUND",
    status: 404,
  });
}

export function conflict(message = "Conflict", details?: unknown) {
  return new AppError({
    message,
    code: "CONFLICT",
    status: 409,
    details,
  });
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new AppError({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      status: 422,
      details: error.flatten(),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return conflict("A record with this value already exists.", {
        target: error.meta?.target,
      });
    }

    if (error.code === "P2025") {
      return notFound("Record not found.");
    }

    return new AppError({
      message: "Database request failed",
      code: "DATABASE_ERROR",
      status: 500,
      details: { prismaCode: error.code },
      expose: false,
    });
  }

  return new AppError({
    message: "Something went wrong",
    code: "INTERNAL_SERVER_ERROR",
    status: 500,
    expose: false,
  });
}

