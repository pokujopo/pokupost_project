/**
 * services/postService.js
 *
 * All post-related API calls.
 */

import apiClient from './apiClient'

const POSTS_BASE = '/api/posts'

/**
 * Fetch the authenticated user's posts (paginated).
 * @param {{ page?, status?, file_type? }} params
 * @returns {{ count, next, previous, results }}
 */
export async function getPosts(params = {}) {
  const { data } = await apiClient.get(`${POSTS_BASE}/`, { params })
  // DRF PageNumberPagination wraps in { count, next, previous, results }
  // Our custom success envelope wraps that in data.data — but list views
  // use DRF's built-in paginator which returns the pagination object directly.
  // Handle both shapes gracefully.
  return data.results ?? data.data?.results ?? data.data ?? []
}

/**
 * Fetch a single post by ID.
 * @param {number} id
 * @returns {Post}
 */
export async function getPost(id) {
  const { data } = await apiClient.get(`${POSTS_BASE}/${id}/`)
  return data.data
}

/**
 * Create a new post.
 * @param {{ file: File, caption: string, platforms: string[] }} payload
 * @param {Function} onUploadProgress  — called with percent (0-100)
 * @returns {Post}
 */
export async function createPost(payload, onUploadProgress) {
  const formData = new FormData()
  formData.append('media',     payload.file)
  formData.append('caption',  payload.caption)

  // Django expects platforms as a JSON string when sent via multipart
  formData.append('platforms', JSON.stringify(payload.platforms))

  const { data } = await apiClient.post(`${POSTS_BASE}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (event.total) {
        const pct = Math.round((event.loaded / event.total) * 100)
        onUploadProgress?.(pct)
      }
    },
  })

  return data.data
}

/**
 * Update a post's caption or platforms.
 * @param {number} id
 * @param {{ caption?, platforms? }} payload
 * @returns {Post}
 */
export async function updatePost(id, payload) {
  const { data } = await apiClient.patch(`${POSTS_BASE}/${id}/`, payload)
  return data.data
}

/**
 * Delete a post.
 * @param {number} id
 */
export async function deletePost(id) {
  await apiClient.delete(`${POSTS_BASE}/${id}/`)
}
