import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ContactForm from "./ContactForm";

const mocks = vi.hoisted(() => ({
  sendMessage: vi.fn(),
  showToast: vi.fn(),
  writeText: vi.fn(),
}));

vi.mock("@/services/contactService", () => ({
  contactService: {
    sendMessage: mocks.sendMessage,
  },
}));

vi.mock("@/components/Toast", () => ({
  useToast: () => ({
    showToast: mocks.showToast,
  }),
}));

describe("ContactForm", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.sendMessage.mockReset();
    mocks.showToast.mockReset();
    mocks.writeText.mockReset();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: mocks.writeText,
      },
    });
  });

  it("restores a saved draft from localStorage", () => {
    localStorage.setItem(
      "contact-form-draft:en",
      JSON.stringify({
        name: "Ada Lovelace",
        email: "ada@example.com",
        subject: "Scheduling platform",
        message: "I would like to discuss a backend-heavy collaboration.",
      }),
    );

    render(<ContactForm locale="en" />);

    expect(screen.getByLabelText("Full name")).toHaveValue("Ada Lovelace");
    expect(screen.getByLabelText("Email address")).toHaveValue("ada@example.com");
    expect(screen.getByLabelText("Subject")).toHaveValue("Scheduling platform");
    expect(screen.getByLabelText("Message")).toHaveValue(
      "I would like to discuss a backend-heavy collaboration.",
    );
  });

  it("keeps the draft and shows fallback actions when submit fails", async () => {
    mocks.sendMessage.mockRejectedValueOnce(new Error("backend unavailable"));

    render(<ContactForm locale="en" />);

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Grace Hopper" },
    });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "grace@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Platform role" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "I am interested in discussing a backend platform opportunity." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await screen.findByText(
      "The contact API is unavailable right now. Your draft is still here so you can copy it or open an email draft instead.",
    );

    expect(localStorage.getItem("contact-form-draft:en")).toContain("Grace Hopper");
    expect(screen.getByRole("button", { name: "Copy message" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open email draft" })).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:yigitokur@ieee.org"),
    );
  });

  it("copies the preserved message when the fallback action is used", async () => {
    mocks.sendMessage.mockRejectedValueOnce(new Error("backend unavailable"));

    render(<ContactForm locale="en" />);

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Linus Torvalds" },
    });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "linus@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Observability" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "I want to talk about distributed systems and observability." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByText(/The contact API is unavailable right now/);

    fireEvent.click(screen.getByRole("button", { name: "Copy message" }));

    await waitFor(() => {
      expect(mocks.writeText).toHaveBeenCalledWith(
        expect.stringContaining("Full name: Linus Torvalds"),
      );
    });
  });

  it("clears the saved draft after a successful submit", async () => {
    mocks.sendMessage.mockResolvedValueOnce({
      success: true,
      message: "Delivered",
      message_id: "msg-1",
    });

    render(<ContactForm locale="en" />);

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Margaret Hamilton" },
    });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "margaret@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Cloud systems" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Let's discuss a cloud-native systems opportunity together." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => {
      expect(mocks.showToast).toHaveBeenCalledWith("success", "Delivered");
    });

    expect(localStorage.getItem("contact-form-draft:en")).toBeNull();
    expect(screen.getByLabelText("Full name")).toHaveValue("");
  });
});
