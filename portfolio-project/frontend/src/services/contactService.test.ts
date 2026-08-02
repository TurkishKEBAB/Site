import { describe, expect, it } from "vitest";

import type { ContactSubmitResponse } from "./contactService";

describe("contact service contract", () => {
  it("includes SMTP delivery status in a submit response", () => {
    const response: ContactSubmitResponse = {
      success: true,
      message: "Received",
      message_id: "message-1",
      email_sent: false,
    };

    expect(response.email_sent).toBe(false);
  });
});
