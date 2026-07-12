import axios from "axios";

// Standard base URL pointing to FastAPI backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically add JWT bearer token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      try {
        const authData = localStorage.getItem("optiprint-auth");
        if (authData) {
          const parsed = JSON.parse(authData);
          const token = parsed?.state?.token;
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (e) {
        console.error("Error reading token from localStorage", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        try {
          const authData = localStorage.getItem("optiprint-auth");
          if (authData) {
            const parsed = JSON.parse(authData);
            const refreshToken = parsed?.state?.refreshToken;

            if (refreshToken) {
              // Attempt token refresh
              const res = await axios.post(`${API_URL}/auth/refresh`, {
                refresh_token: refreshToken,
              });

              if (res.status === 200 && res.data?.access_token) {
                const { access_token, refresh_token, user } = res.data;

                // Update Zustand storage
                parsed.state.token = access_token;
                parsed.state.refreshToken = refresh_token;
                parsed.state.user = user;
                localStorage.setItem("optiprint-auth", JSON.stringify(parsed));

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);
              }
            }
          }
        } catch (refreshError) {
          console.error("Refresh token failed, logging out...", refreshError);
          // Clean up auth and redirect to login
          localStorage.removeItem("optiprint-auth");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
export default api;
