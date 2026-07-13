import type { AdminCopy } from "@/components/admin/types";
import type { Technology } from "@/services/technologyService";

interface TechnologiesTabProps {
  text: Pick<
    AdminCopy,
    | "technologyManagement"
    | "addTechnology"
    | "edit"
    | "delete"
    | "deleting"
    | "technologyLoading"
    | "noTechnologies"
  >;
  technologies: Technology[];
  technologiesLoading: boolean;
  technologyActionId: string | null;
  onCreateTechnology: () => void;
  onEditTechnology: (technology: Technology) => void;
  onDeleteTechnology: (technologyId: string) => void;
}

export function TechnologiesTab({
  text,
  technologies,
  technologiesLoading,
  technologyActionId,
  onCreateTechnology,
  onEditTechnology,
  onDeleteTechnology,
}: TechnologiesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{text.technologyManagement}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage the technology catalog used by project records.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateTechnology}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {text.addTechnology}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600">
          <thead className="bg-gray-50 dark:bg-dark-800/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Color</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-dark-600 dark:bg-gray-900/20">
            {technologiesLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  {text.technologyLoading}
                </td>
              </tr>
            )}

            {!technologiesLoading && technologies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  {text.noTechnologies}
                </td>
              </tr>
            )}

            {!technologiesLoading && technologies.map((technology) => (
              <tr key={technology.id} className="hover:bg-primary-400/[0.04]">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  <span className="mr-2" aria-hidden="true">{technology.icon || "◆"}</span>
                  {technology.name || "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{technology.slug || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{technology.category || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {technology.color ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border border-gray-300" style={{ backgroundColor: technology.color }} aria-hidden="true" />
                      <span className="font-mono text-xs">{technology.color}</span>
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditTechnology(technology)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {text.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTechnology(technology.id)}
                      className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900/40"
                      disabled={technologyActionId === technology.id}
                    >
                      {technologyActionId === technology.id ? text.deleting : text.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
