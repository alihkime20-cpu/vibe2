import api from './api';

const videos = {
  async getFeed(page = 1) {
    return api.get(`/videos/feed?page=${page}`);
  },

  async getVideo(videoId) {
    return api.get(`/videos/${videoId}`);
  },

  async likeVideo(videoId) {
    return api.post(`/videos/${videoId}/like`);
  },

  async unlikeVideo(videoId) {
    return api.delete(`/videos/${videoId}/like`);
  },

  async getComments(videoId, page = 1) {
    return api.get(
      `/videos/${videoId}/comments?page=${page}`
    );
  },

  async addComment(videoId, comment) {
    return api.post(
      `/videos/${videoId}/comments`,
      { comment }
    );
  },

  async shareVideo(videoId) {
    return api.post(`/videos/${videoId}/share`);
  },
};

export default videos;