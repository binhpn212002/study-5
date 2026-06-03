// src/lib/axios.ts

import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true,
});


//interceptor

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


//error interceptor

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      await api.post(
        "/auth/refresh-token",
        {
          refreshToken: localStorage.getItem("refresh_token"),
        }
      ).then((res) => {
        if (res.status === 200) {
          localStorage.setItem("access_token", res.data.accessToken);
          localStorage.setItem("refresh_token", res.data.refreshToken);
        }
      }).catch((err) => {
        return Promise.reject(err);
      });

      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;