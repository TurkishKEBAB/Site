import type { AdminCopy, AdminSkill } from "@/components/admin/types";

interface SkillsTabProps {
  text: Pick<AdminCopy, "skillManagement" | "addSkill" | "edit" | "delete">;
  skills: AdminSkill[];
  skillsLoading: boolean;
  onCreateSkill: () => void;
  onEditSkill: (skill: AdminSkill) => void;
  onDeleteSkill: (skillId: string) => void;
}

export function SkillsTab({
  text,
  skills,
  skillsLoading,
  onCreateSkill,
  onEditSkill,
  onDeleteSkill,
}: SkillsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{text.skillManagement}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kayıtlı becerileri listele, düzenle veya sil.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateSkill}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {text.addSkill}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/30">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                İsim
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Kategori
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Yeterlilik
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900/20">
            {skillsLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Beceriler yükleniyor...
                </td>
              </tr>
            )}

            {!skillsLoading && skills.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Henüz beceri bulunmuyor.
                </td>
              </tr>
            )}

            {!skillsLoading && skills.map((skill) => (
              <tr key={skill.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {skill.name || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {skill.category || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {skill.proficiency}%
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditSkill(skill)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {text.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSkill(skill.id)}
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
