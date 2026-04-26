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
});
