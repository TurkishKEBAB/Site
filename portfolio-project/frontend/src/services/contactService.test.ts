import { describe, expect, it } from "vitest";

import type { ContactSubmitResponse } from "./contactService";

describe("contact service contract", () => {
  it("reports whether email delivery was queued in a submit response", () => {
    const response: ContactSubmitResponse = {
      success: true,
      message: "Received",
      message_id: "message-1",
      email_queued: false,
    };

    expect(response.email_queued).toBe(false);
  });
});
