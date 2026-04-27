import { AxiosError, type AxiosAdapter, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import api, { browserNavigation } from "./api";

const rejectWithStatus = (status: number): AxiosAdapter => async (config) => {
  const response: AxiosResponse = {
    data: { message: "Request failed" },
    status,
    statusText: String(status),
    headers: {},
    config,
  };

  throw new AxiosError(
    `Request failed with status code ${status}`,
    undefined,
    config,
    undefined,
    response,
  );
};

describe("api service auth responses", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    window.history.pushState({}, "", "/");
  });

  it("keeps stored tokens after a 403 response", async () => {
    localStorage.setItem("token", "access-token");
    localStorage.setItem("refresh_token", "refresh-token");
    window.history.pushState({}, "", "/admin");

    const redirectSpy = vi
      .spyOn(browserNavigation, "redirectToLogin")
      .mockImplementation(() => {
        window.history.pushState({}, "", "/login");
      });

    await expect(
      api.get("/projects/private", {
        adapter: rejectWithStatus(403),
        headers: { "X-Skip-Global-Error": true },
      }),
    ).rejects.toMatchObject({ response: { status: 403 } });

    expect(localStorage.getItem("token")).toBe("access-token");
    expect(localStorage.getItem("refresh_token")).toBe("refresh-token");
    expect(redirectSpy).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe("/admin");
  });

  it("clears stored tokens and redirects admin pages after a 401 response", async () => {
    localStorage.setItem("token", "access-token");
    localStorage.setItem("refresh_token", "refresh-token");
    window.history.pushState({}, "", "/admin/projects");

    const redirectSpy = vi
      .spyOn(browserNavigation, "redirectToLogin")
      .mockImplementation(() => {
        window.history.pushState({}, "", "/login");
      });

    await expect(
      api.get("/projects/private", {
        adapter: rejectWithStatus(401),
        headers: { "X-Skip-Global-Error": true },
      }),
    ).rejects.toMatchObject({ response: { status: 401 } });

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(window.location.pathname).toBe("/login");
  });

  it("dispatches parsed API error details for global handlers", async () => {
    const listener = vi.fn();
    window.addEventListener("api:error", listener);

    try {
      await expect(
        api.get("/contact/", {
          adapter: async (config) => {
            const response: AxiosResponse = {
              data: {
                success: false,
                error: {
                  code: "VALIDATION_ERROR",
                  message: "Validation Error",
                  fields: { email: "Invalid email" },
                  request_id: "req-frontend",
                },
                detail: "Validation Error",
              },
              status: 422,
              statusText: "422",
              headers: {},
              config,
            };

            throw new AxiosError(
              "Request failed with status code 422",
              undefined,
              config,
              undefined,
              response,
            );
          },
        }),
      ).rejects.toMatchObject({ response: { status: 422 } });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].detail).toMatchObject({
        status: 422,
        code: "VALIDATION_ERROR",
        message: "Validation Error",
        fields: { email: "Invalid email" },
        requestId: "req-frontend",
      });
    } finally {
      window.removeEventListener("api:error", listener);
    }
  });
});
