import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";

import { parseApiError } from "./errors";

const axiosError = (response: AxiosResponse) =>
  new AxiosError(
    "Request failed",
    undefined,
    response.config,
    undefined,
    response,
  );

const responseConfig = { headers: new AxiosHeaders() } as AxiosResponse["config"];

describe("parseApiError", () => {
  it("reads the standardized API error envelope", () => {
    const parsed = parseApiError(
      axiosError({
        data: {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation Error",
            fields: { email: "Input should be a valid email" },
            request_id: "req-1",
          },
          detail: "Validation Error",
        },
        status: 422,
        statusText: "Unprocessable Entity",
        headers: {},
        config: responseConfig,
      }),
    );

    expect(parsed).toMatchObject({
      status: 422,
      code: "VALIDATION_ERROR",
      message: "Validation Error",
      fields: { email: "Input should be a valid email" },
      requestId: "req-1",
    });
  });

  it("falls back to legacy FastAPI detail payloads", () => {
    const parsed = parseApiError(
      axiosError({
        data: { detail: "Project not found" },
        status: 404,
        statusText: "Not Found",
        headers: { "x-request-id": "req-2" },
        config: responseConfig,
      }),
    );

    expect(parsed).toMatchObject({
      status: 404,
      code: "HTTP_ERROR",
      message: "Project not found",
      requestId: "req-2",
    });
  });

  it("uses legacy message and error fields when detail is unavailable", () => {
    expect(
      parseApiError(
        axiosError({
          data: { message: "Backend unavailable" },
          status: 503,
          statusText: "Service Unavailable",
          headers: {},
          config: responseConfig,
        }),
      ),
    ).toMatchObject({
      status: 503,
      code: "HTTP_ERROR",
      message: "Backend unavailable",
    });

    expect(
      parseApiError(
        axiosError({
          data: { error: "Forbidden" },
          status: 403,
          statusText: "Forbidden",
          headers: {},
          config: responseConfig,
        }),
      ),
    ).toMatchObject({
      status: 403,
      code: "HTTP_ERROR",
      message: "Forbidden",
    });
  });

  it("normalizes non-Axios failures", () => {
    expect(parseApiError(new Error("boom"))).toMatchObject({
      code: "UNKNOWN_ERROR",
      message: "boom",
    });

    expect(parseApiError(null, "Fallback")).toMatchObject({
      code: "UNKNOWN_ERROR",
      message: "Fallback",
    });
  });
});
