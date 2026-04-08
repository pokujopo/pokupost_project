/**
 * services/authService.js
 *
 * All authentication API calls.
 * Token storage is handled here so the rest of the app stays clean.
 */

import apiClient from './apiClient'

const AUTH_BASE = '/api'

// ── Token helpers ────────────────────────────────────────────────────────────

export const tokenStorage = {
  save(accessToken, refreshToken, user) {
    localStorage.setItem('access_token',  accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('user',          JSON.stringify(user))
  },
  clear() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },
  getAccess()  { return localStorage.getItem('access_token') },
  getRefresh() { return localStorage.getItem('refresh_token') },
  getUser()    {
    try { return JSON.parse(localStorage.getItem('user')) }
    catch { return null }
  },
  isAuthenticated() { return !!localStorage.getItem('access_token') },
}

// ── API calls ────────────────────────────────────────────────────────────────

/**
 * Register a new account.
 * @param {{ name, email, password, password_confirmation }} payload
 * @returns {{ user, access_token, refresh_token }}
 */
export async function register(payload) {
  const { data } = await apiClient.post(`${AUTH_BASE}/register/`, payload)
  const { user, access_token, refresh_token } = data.data
  tokenStorage.save(access_token, refresh_token, user)
  return data.data
}

/**
 * Login with email + password.
 * @param {{ email, password }} credentials
 * @returns {{ user, access_token, refresh_token }}
 */
export async function login(credentials) {
  const { data } = await apiClient.post(`${AUTH_BASE}/login/`, credentials)
  const { user, access_token, refresh_token } = data.data
  tokenStorage.save(access_token, refresh_token, user)
  return data.data
}

/**
 * Logout — blacklists the refresh token on the server, then clears local storage.
 */
export async function logout() {
  const refresh_token = tokenStorage.getRefresh()
  try {
    if (refresh_token) {
      await apiClient.post(`${AUTH_BASE}/logout/`, { refresh_token })
    }
  } finally {
    tokenStorage.clear()
  }
}

/**
 * Fetch the current user's profile.
 * @returns {User}
 */
export async function getMe() {
  const { data } = await apiClient.get(`${AUTH_BASE}/me/`)
  return data.data
}
