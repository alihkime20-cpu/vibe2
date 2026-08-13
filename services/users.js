import api from './api';

const users = {
  async getProfile(userId) {
    return api.get(`/users/${userId}`);
  },

  async updateProfile(profileData) {
    return api.put('/users/me', profileData);
  },

  async followUser(userId) {
    return api.post(`/users/${userId}/follow`);
  },

  async unfollowUser(userId) {
    return api.delete(`/users/${userId}/follow`);
  },

  async searchUsers(query) {
    return api.get(
      `/users/search?q=${encodeURIComponent(query)}`
    );
  },
};

export default users;