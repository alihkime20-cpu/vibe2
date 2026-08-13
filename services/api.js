import config from '../constants/config';

const api = {
  async request(endpoint, options = {}) {
    if (!config.API_URL) {
      throw new Error('API_URL غير مُعد بعد.');
    }

    const response = await fetch(
      `${config.API_URL}${endpoint}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        ...options,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || 'حدث خطأ في الاتصال بالخادم.'
      );
    }

    return data;
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },
};

export default api;