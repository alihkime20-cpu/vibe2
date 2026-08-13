import api from './api';

const notifications = {
  async getNotifications(page = 1) {
    return api.get(`/notifications?page=${page}`);
  },

  async markAsRead(notificationId) {
    return api.put(
      `/notifications/${notificationId}/read`
    );
  },

  async markAllAsRead() {
    return api.put('/notifications/read-all');
  },
};

export default notifications;