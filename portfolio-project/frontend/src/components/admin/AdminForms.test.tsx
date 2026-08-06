import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  defaultSkillFormValues,
  SkillForm,
  type SkillFormValues,
} from "./AdminForms";

const renderSkillForm = (initialValues: SkillFormValues = defaultSkillFormValues) => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onCancel = vi.fn();

  render(
    <SkillForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      loading={false}
      mode="edit"
      language="en"
    />,
  );

  return { onSubmit, onCancel };
};

describe("SkillForm", () => {
  it("keeps the selected category visible and exposes bilingual skill names", () => {
    renderSkillForm({
      ...defaultSkillFormValues,
      name: "Docker",
      nameTr: "Docker",
      sameName: true,
      category: "Cloud & DevOps",
    });

    expect(screen.getByLabelText(/^Category/)).toHaveValue("Cloud & DevOps");
    expect(screen.getByRole("option", { name: "Cloud & DevOps / Bulut ve DevOps" })).toBeInTheDocument();
    expect(screen.getByLabelText(/^English Name/)).toHaveValue("Docker");
    expect(screen.getByLabelText(/^Turkish Name/)).toHaveValue("Docker");
    expect(screen.getByRole("checkbox", { name: "Turkish and English names are the same" })).toBeChecked();
  });

  it("mirrors the English name while the same-name option is selected", () => {
    renderSkillForm({
      ...defaultSkillFormValues,
      name: "Docker",
      nameTr: "Docker",
      sameName: true,
      category: "Cloud & DevOps",
    });

    fireEvent.change(screen.getByLabelText(/^English Name/), { target: { value: "Docker Engine" } });

    expect(screen.getByLabelText(/^Turkish Name/)).toHaveValue("Docker Engine");
  });
});
