import type { AdminCopy, AdminProject } from "@/components/admin/types";
import { formatAdminDate } from "@/lib/admin/format";

interface ProjectsTabProps {
  text: Pick<
    AdminCopy,
    "projectManagement" | "addProject" | "translate" | "images" | "dossier" | "edit" | "delete" | "deleting" | "yes" | "no"
  >;
  projects: AdminProject[];
  projectsLoading: boolean;
  projectActionId: string | null;
  dateLocale: string;
  onCreateProject: () => void;
  onEditProject: (project: AdminProject) => void;
  onDeleteProject: (project: AdminProject) => void;
  onOpenImageManager: (project: AdminProject) => void;
  onOpenDossierManager: (project: AdminProject) => void;
  onOpenTranslationManager: (project: AdminProject) => void;
}

export function ProjectsTab({
  text,
  projects,
  projectsLoading,
  projectActionId,
  dateLocale,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onOpenImageManager,
  onOpenDossierManager,
  onOpenTranslationManager,
}: ProjectsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {text.projectManagement}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kayıtlı projeleri listele, yeni projeler ekle veya mevcutları güncelle.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateProject}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {text.addProject}
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
                Slug
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Öne Çıkan
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Sıra
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Güncellendi
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-dark-600 dark:bg-gray-900/20">
            {projectsLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Projeler yükleniyor...
                </td>
              </tr>
            )}

            {!projectsLoading && projects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Bu alanda henüz proje bulunmuyor. Yeni bir proje oluşturabilirsiniz.
                </td>
              </tr>
            )}

            {!projectsLoading && projects.map((project) => (
              <tr key={project.id} className="hover:bg-primary-400/[0.04]">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {project.title || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {project.slug || "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {project.featured ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                      {text.yes}
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {text.no}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {project.displayOrder}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {formatAdminDate(project.updatedAt, dateLocale)}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenTranslationManager(project)}
                      className="rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/40"
                      title="Çevirileri yönet"
                    >
                      🌐 {text.translate}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenImageManager(project)}
                      className="rounded-lg border border-purple-500 px-3 py-1.5 text-xs font-semibold text-purple-600 transition hover:bg-purple-50 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-900/40"
                      title="Proje resimlerini yönet"
                    >
                      🖼️ {text.images}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDossierManager(project)}
                      className="rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                      title="Manage project dossier"
                    >
                      {text.dossier}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditProject(project)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {text.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProject(project)}
                      className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900/40"
                      disabled={projectActionId === project.id}
                    >
                      {projectActionId === project.id ? text.deleting : text.delete}
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
