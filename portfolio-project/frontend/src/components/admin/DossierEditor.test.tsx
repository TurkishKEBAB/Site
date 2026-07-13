import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  DossierEditor,
  emptyDossierFormValues,
} from "./DossierEditor";

describe("DossierEditor", () => {
  it("emits edited impact and metric values", () => {
    const onSubmit = vi.fn();

    render(
      <DossierEditor
        initialValues={emptyDossierFormValues}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        language="en"
      />,
    );

    fireEvent.change(screen.getByLabelText("Impact (English)"), {
      target: { value: "Reduced deploy time" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Metrics" }));
    fireEvent.click(screen.getByRole("button", { name: /Add metric/ }));
    fireEvent.change(screen.getByLabelText("Metric label 1"), {
      target: { value: "Deploy time" },
    });
    fireEvent.change(screen.getByLabelText("Metric value 1"), {
      target: { value: "18 min" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save dossier" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        impactEn: "Reduced deploy time",
        metrics: [
          expect.objectContaining({
            label: "Deploy time",
            value: "18 min",
          }),
        ],
      }),
    );
  });
});
