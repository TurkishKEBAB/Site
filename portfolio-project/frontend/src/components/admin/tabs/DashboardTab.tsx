import type { AdminCopy } from "@/components/admin/types";

interface DashboardTabProps {
  text: Pick<AdminCopy, "welcomeUser">;
  username?: string;
}

export function DashboardTab({ text, username }: DashboardTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {text.welcomeUser}, {username || "Yiğit"}! 👋
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Backend bağlantısı aktif; projeler sekmesinden içerik oluşturabilir, istatistikleri anlık
          takip edebilirsin. Beceriler ve mesajlar için gelişmiş yönetim ekranları sıradaki iterasyonda
          devreye girecek.
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">🚀 Odaklanılacak Başlıklar</h3>
        <ul className="ml-4 space-y-2 text-blue-800 dark:text-blue-200">
          <li>Proje listesi üzerinden CRUD akışlarını test et.</li>
          <li>Mesaj sekmesi için backend endpoint'lerini bağla.</li>
          <li>Yetki hataları için otomatik yönlendirmeyi doğrula.</li>
        </ul>
      </div>
    </div>
  );
}
