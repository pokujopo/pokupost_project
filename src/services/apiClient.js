/**
 * services/apiClient.js
 *
 * Central Axios instance.  Every service module imports from here.
 *
 * Responsibilities:
 *   • Set baseURL so every call hits Django regardless of Vite proxy config.
 *   • Attach Bearer token from localStorage to every request.
 *   • Intercept 401 responses → clear storage → redirect to /login.
 *   • Intercept token-refresh on 401 (single retry with new access token).
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

// ── Request interceptor — attach JWT ────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor — handle 401 with silent token refresh ─────────────
let isRefreshing = false
let refreshQueue = []   // pending requests while refresh is in-flight

const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token)
  })
  refreshQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Only attempt refresh on 401, and not on the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/api/token/refresh/')
    ) {
      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        clearAuthAndRedirect()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Queue this request until the refresh resolves
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        }).then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`
          return apiClient(original)
        })
      }

      original._retry = true
      isRefreshing    = true

      try {
        const { data } = await axios.post(`${BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        })

        const newAccessToken = data.access
        localStorage.setItem('access_token', newAccessToken)
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)
        original.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuthAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

function clearAuthAndRedirect() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  // Hard redirect — avoids stale React Router state
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

export default apiClient
