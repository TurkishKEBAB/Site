import type { AdminCopy, AdminMessage } from "@/components/admin/types";
import { formatAdminDate } from "@/lib/admin/format";

interface MessagesTabProps {
  text: Pick<AdminCopy, "incomingMessages" | "delete" | "deleting">;
  messages: AdminMessage[];
  messagesLoading: boolean;
  messageActionId: string | null;
  dateLocale: string;
  onMarkAsRead: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

export function MessagesTab({
  text,
  messages,
  messagesLoading,
  messageActionId,
  dateLocale,
  onMarkAsRead,
  onDeleteMessage,
}: MessagesTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{text.incomingMessages}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          İletişim formundan gelen mesajları yönetin.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/30">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                İsim
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                E-posta
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Konu
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Durum
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tarih
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900/20">
            {messagesLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Mesajlar yükleniyor...
                </td>
              </tr>
            )}

            {!messagesLoading && messages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Henüz mesaj bulunmuyor.
                </td>
              </tr>
            )}

            {!messagesLoading && messages.map((message) => (
              <tr key={message.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {message.name || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {message.email || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {message.subject || "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {!message.is_read ? (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                      Okunmadı
                    </span>
                  ) : message.is_replied ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                      Yanıtlandı
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      Okundu
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {formatAdminDate(message.created_at, dateLocale)}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    {!message.is_read && (
                      <button
                        type="button"
                        onClick={() => onMarkAsRead(message.id)}
                        className="rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/40"
                        disabled={messageActionId === message.id}
                      >
                        {messageActionId === message.id ? "İşleniyor..." : "Okundu"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(message.id)}
                      className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900/40"
                      disabled={messageActionId === message.id}
                    >
                      {messageActionId === message.id ? text.deleting : text.delete}
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
