import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RefObject, useRef, useState } from "react";
import { describe, expect, it } from "vitest";

import { useAdminModalFocusTrap } from "./useAdminModalFocusTrap";

function FocusTrapHarness() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useAdminModalFocusTrap(open ? (modalRef as RefObject<HTMLElement | null>) : null);

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      {open && (
        <div ref={modalRef} tabIndex={-1} role="dialog" aria-label="Modal">
          <button type="button">First</button>
          <button type="button">Last</button>
        </div>
      )}
    </div>
  );
}

describe("useAdminModalFocusTrap", () => {
  it("focuses the first control and cycles tab focus inside the modal", async () => {
    render(<FocusTrapHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    const modal = screen.getByRole("dialog", { name: "Modal" });
    const first = screen.getByRole("button", { name: "First" });
    const last = screen.getByRole("button", { name: "Last" });

    await waitFor(() => {
      expect(first).toHaveFocus();
    });

    fireEvent.keyDown(modal, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();

    fireEvent.keyDown(modal, { key: "Tab" });
    expect(first).toHaveFocus();
  });
});
