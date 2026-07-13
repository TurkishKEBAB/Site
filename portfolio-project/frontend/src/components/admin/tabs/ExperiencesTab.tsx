import type { AdminCopy, AdminExperience } from "@/components/admin/types";
import type { AdminLanguage } from "@/components/admin/AdminForms";

interface ExperiencesTabProps {
  text: Pick<AdminCopy, "experienceManagement" | "addExperience" | "edit" | "delete">;
  experiences: AdminExperience[];
  experiencesLoading: boolean;
  adminLanguage: AdminLanguage;
  dateLocale: string;
  onCreateExperience: () => void;
  onEditExperience: (experience: AdminExperience) => void;
  onDeleteExperience: (experienceId: string) => void;
}

export function ExperiencesTab({
  text,
  experiences,
  experiencesLoading,
  adminLanguage,
  dateLocale,
  onCreateExperience,
  onEditExperience,
  onDeleteExperience,
}: ExperiencesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{text.experienceManagement}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kayıtlı deneyimleri listele, düzenle veya sil.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateExperience}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {text.addExperience}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600">
          <thead className="bg-gray-50 dark:bg-dark-800/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Başlık
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Kuruluş
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tür
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tarih
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-dark-600 dark:bg-gray-900/20">
            {experiencesLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Deneyimler yükleniyor...
                </td>
              </tr>
            )}

            {!experiencesLoading && experiences.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Henüz deneyim bulunmuyor.
                </td>
              </tr>
            )}

            {!experiencesLoading && experiences.map((experience) => (
              <tr key={experience.id} className="hover:bg-primary-400/[0.04]">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {experience.title || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {experience.organization || "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {experience.experience_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {new Date(experience.start_date).toLocaleDateString(dateLocale)}
                  {experience.is_current
                    ? adminLanguage === "tr"
                      ? " - Devam ediyor"
                      : " - Ongoing"
                    : experience.end_date
                      ? ` - ${new Date(experience.end_date).toLocaleDateString(dateLocale)}`
                      : ""}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditExperience(experience)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {text.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteExperience(experience.id)}
                      className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900/40"
                    >
                      {text.delete}
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
