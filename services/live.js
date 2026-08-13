import api from './api';

const live = {
  async getLiveStreams(page = 1) {
    return api.get(`/live?page=${page}`);
  },

  async getLiveStream(streamId) {
    return api.get(`/live/${streamId}`);
  },

  async createLiveStream(data) {
    return api.post('/live', data);
  },

  async endLiveStream(streamId) {
    return api.post(`/live/${streamId}/end`);
  },

  async joinLiveStream(streamId) {
    return api.post(`/live/${streamId}/join`);
  },

  async leaveLiveStream(streamId) {
    return api.post(`/live/${streamId}/leave`);
  },

  async sendGift(streamId, giftId) {
    return api.post(`/live/${streamId}/gifts`, {
      giftId,
    });
  },
};

export default live;