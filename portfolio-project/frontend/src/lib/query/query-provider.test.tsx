import { render, screen } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { QueryProvider } from "./query-provider";

function QueryDefaultsProbe() {
  const queryClient = useQueryClient();
  const options = queryClient.getDefaultOptions().queries;

  return (
    <dl>
      <dt>staleTime</dt>
      <dd data-testid="stale-time">{String(options?.staleTime)}</dd>
      <dt>retry</dt>
      <dd data-testid="retry">{String(options?.retry)}</dd>
      <dt>refetchOnWindowFocus</dt>
      <dd data-testid="refetch-on-window-focus">
        {String(options?.refetchOnWindowFocus)}
      </dd>
    </dl>
  );
}

describe("QueryProvider", () => {
  it("provides the public query defaults", () => {
    render(
      <QueryProvider>
        <QueryDefaultsProbe />
      </QueryProvider>,
    );

    expect(screen.getByTestId("stale-time")).toHaveTextContent("60000");
    expect(screen.getByTestId("retry")).toHaveTextContent("1");
    expect(screen.getByTestId("refetch-on-window-focus")).toHaveTextContent(
      "false",
    );
  });
});
