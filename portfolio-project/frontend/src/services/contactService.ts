import api, { apiEndpoints } from './api';

export interface ContactMessageResponse {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_replied: boolean;
  created_at: string;
}

export interface ContactMessagesListResponse {
  messages: ContactMessageResponse[];
  total: number;
  skip: number;
  limit: number;
  unread_count: number;
}

export const contactService = {
  // İletişim formu gönder
  async sendMessage(data: Omit<ContactMessageResponse, 'id' | 'is_read' | 'is_replied' | 'created_at'>): Promise<{ success: boolean; message: string }> {
    const response = await api.post(apiEndpoints.contact.send, data);
    return response.data;
  },

  // Admin: Tüm mesajları listele
  async getMessages(params?: { skip?: number; limit?: number; unread_only?: boolean }): Promise<ContactMessagesListResponse> {
    const response = await api.get('/contact/', { params });
    return response.data;
  },

  // Admin: Mesajı okundu olarak işaretle
  async markAsRead(messageId: string): Promise<ContactMessageResponse> {
    const response = await api.patch(`/contact/${messageId}/read`);
    return response.data;
  },

  // Admin: Mesajı yanıtlandı olarak işaretle
  async markAsReplied(messageId: string): Promise<ContactMessageResponse> {
    const response = await api.patch(`/contact/${messageId}/replied`);
    return response.data;
  },

  // Admin: Mesajı sil
  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/contact/${messageId}`);
  },

  // Admin: Okunmamış mesaj sayısı
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/contact/unread-count');
    return response.data.unread_count;
  },
};
