import api from './api';

const auth = {
  async loginWithGoogle(idToken) {
    return api.post('/auth/google', {
      idToken,
    });
  },

  async logout() {
    return api.post('/auth/logout');
  },

  async getCurrentUser() {
    return api.get('/auth/me');
  },
};

export default auth;