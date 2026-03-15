import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle expired access token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response, // pass through successful responses
  async (error) => {
    const originalRequest = error?.config;
    const requestUrl = originalRequest?.url || "";
    const isRefreshRequest = requestUrl.includes("/user/refresh-token");

    // Only handle 401 and don't retry refresh calls (infinite loop prevention)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
      const storedRefreshToken = localStorage.getItem("refresh-token");

      if (!storedRefreshToken) {
        // No refresh token — force logout
        localStorage.removeItem("access-token");
        localStorage.removeItem("refresh-token");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue requests that arrive while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post("/user/refresh-token", {
          refreshToken: storedRefreshToken,
        });
        const newAccessToken = response?.data?.accessToken || response?.data?.token;

        if (!newAccessToken) {
          throw new Error("Refresh succeeded but access token was not returned");
        }

        localStorage.setItem("access-token", newAccessToken);
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        // Retry the original request with the new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("access-token");
        localStorage.removeItem("refresh-token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;