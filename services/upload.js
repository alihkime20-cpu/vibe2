import api from './api';

const upload = {
  async createUpload(video) {
    return api.post('/videos/upload', {
      name: video.name,
      type: video.type,
      size: video.size,
    });
  },

  async publishVideo(videoData) {
    return api.post('/videos/publish', videoData);
  },

  async deleteVideo(videoId) {
    return api.delete(`/videos/${videoId}`);
  },
};

export default upload;