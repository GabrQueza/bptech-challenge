import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
});

let isLoggingOut = false;
let failedQueue: Array<{ resolve: Function, reject: Function }> = [];

const processQueue = (error: any) => {
  failedQueue.forEach(prom => {
    prom.reject(error);
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isLoggingOut) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isLoggingOut = true;

      localStorage.removeItem('access_token');
      processQueue(error);
      
      window.location.href = '/login';

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
