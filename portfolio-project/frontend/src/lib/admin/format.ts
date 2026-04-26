export function formatAdminDate(value: string | null, locale: string): string {
  if (!value) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch (error) {
    console.error("Failed to format date:", error);
    return "—";
  }
}
