import axios from "axios";

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
    details?: unknown;
    request_id?: string;
  };
  detail?: unknown;
}

export interface ParsedApiError {
  status?: number;
  code: string;
  message: string;
  fields?: Record<string, string>;
  requestId?: string;
  original: unknown;
}

const DEFAULT_ERROR = "Request failed";

const isApiErrorEnvelope = (value: unknown): value is ApiErrorEnvelope => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeEnvelope = value as Partial<ApiErrorEnvelope>;
  return (
    maybeEnvelope.success === false &&
    !!maybeEnvelope.error &&
    typeof maybeEnvelope.error === "object" &&
    typeof maybeEnvelope.error.code === "string" &&
    typeof maybeEnvelope.error.message === "string"
  );
};

const messageFromLegacyPayload = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  for (const key of ["message", "error", "detail"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
};

export function parseApiError(
  error: unknown,
  fallbackMessage = DEFAULT_ERROR,
): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data;

    if (isApiErrorEnvelope(payload)) {
      return {
        status: error.response?.status,
        code: payload.error.code,
        message: payload.error.message,
        fields: payload.error.fields,
        requestId:
          payload.error.request_id ??
          (error.response?.headers?.["x-request-id"] as string | undefined),
        original: error,
      };
    }

    return {
      status: error.response?.status,
      code: "HTTP_ERROR",
      message:
        messageFromLegacyPayload(payload) ?? error.message ?? fallbackMessage,
      requestId: error.response?.headers?.["x-request-id"] as string | undefined,
      original: error,
    };
  }

  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message || fallbackMessage,
      original: error,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: fallbackMessage,
    original: error,
  };
}
