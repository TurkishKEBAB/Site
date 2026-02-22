import api, { apiEndpoints } from './api';

export interface ContactMessageCreateRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactSubmitResponse {
  success: boolean;
  message: string;
  message_id: string;
}

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
  async sendMessage(data: ContactMessageCreateRequest): Promise<ContactSubmitResponse> {
    const response = await api.post(apiEndpoints.contact.send, data);
    return response.data;
  },

  async getMessages(params?: {
    skip?: number;
    limit?: number;
    unread_only?: boolean;
  }): Promise<ContactMessagesListResponse> {
    const response = await api.get(apiEndpoints.contact.list, { params });
    return response.data;
  },

  async markAsRead(messageId: string): Promise<ContactMessageResponse> {
    const response = await api.patch(apiEndpoints.contact.markRead(messageId));
    return response.data;
  },

  async markAsReplied(messageId: string): Promise<ContactMessageResponse> {
    const response = await api.patch(apiEndpoints.contact.markReplied(messageId));
    return response.data;
  },

  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(apiEndpoints.contact.delete(messageId));
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get(apiEndpoints.contact.unreadCount);
    return response.data.unread_count;
  },
};
