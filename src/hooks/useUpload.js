/**
 * hooks/useUpload.js
 *
 * Real upload hook — sends file + caption + platforms to the Django API.
 * Tracks actual Axios upload progress (not simulated).
 */

import { useState, useCallback, useRef } from 'react'
import { isVideoFile, isImageFile } from '@/utils/formatters'
import { createPost } from '@/services/postService'
import { PLATFORM_KEYS } from '@/data/platforms'

const buildInitialPlatforms = () =>
  Object.fromEntries(PLATFORM_KEYS.map((k) => [k, false]))

const INITIAL_STATE = {
  file:        null,
  previewUrl:  null,
  fileType:    null,
  caption:     '',
  platforms:   buildInitialPlatforms(),
  uploading:   false,
  progress:    0,       // real Axios upload progress 0-100
  success:     false,
  error:       null,
  createdPost: null,
}

export function useUpload(onSuccess) {
  const [state, setState]   = useState(INITIAL_STATE)
  const prevPreviewUrl      = useRef(null)

  const patch = useCallback((partial) =>
    setState((prev) => ({ ...prev, ...partial })), [])

  // ── File ────────────────────────────────────────────────────────────────
  const setFile = useCallback((file) => {
    if (!file) return
    if (!isVideoFile(file) && !isImageFile(file)) {
      patch({ error: 'Only video and image files are supported.' })
      return
    }
    if (prevPreviewUrl.current) URL.revokeObjectURL(prevPreviewUrl.current)
    const url = URL.createObjectURL(file)
    prevPreviewUrl.current = url
    patch({
      file,
      previewUrl:  url,
      fileType:    isVideoFile(file) ? 'video' : 'image',
      success:     false,
      error:       null,
      progress:    0,
      createdPost: null,
    })
  }, [patch])

  const clearFile = useCallback(() => {
    if (prevPreviewUrl.current) URL.revokeObjectURL(prevPreviewUrl.current)
    prevPreviewUrl.current = null
    patch({ file: null, previewUrl: null, fileType: null })
  }, [patch])

  // ── Caption & Platforms ──────────────────────────────────────────────────
  const setCaption = useCallback((caption) => patch({ caption }), [patch])

  const togglePlatform = useCallback((platform) =>
    setState((prev) => ({
      ...prev,
      platforms: { ...prev.platforms, [platform]: !prev.platforms[platform] },
    })), [])

  // ── Derived ──────────────────────────────────────────────────────────────
  const selectedPlatforms = Object.entries(state.platforms)
    .filter(([, v]) => v).map(([k]) => k)

  const isValid =
    !!state.file &&
    state.caption.trim().length > 0 &&
    selectedPlatforms.length > 0

  // ── Submit — real API call ───────────────────────────────────────────────
  const submit = useCallback(async () => {
    if (!isValid || state.uploading) return

    patch({ uploading: true, success: false, error: null, progress: 0 })

    try {
      const post = await createPost(
        {
          file:      state.file,
          caption:   state.caption.trim(),
          platforms: selectedPlatforms,
        },
        (pct) => patch({ progress: pct }),
      )

      patch({ uploading: false, success: true, progress: 100, createdPost: post })
      onSuccess?.(post)

      // Reset form after 3 s
      setTimeout(() => {
        if (prevPreviewUrl.current) URL.revokeObjectURL(prevPreviewUrl.current)
        prevPreviewUrl.current = null
        setState({ ...INITIAL_STATE, platforms: buildInitialPlatforms() })
      }, 3000)
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.file?.[0] ||
        err.response?.data?.errors?.caption?.[0] ||
        'Upload failed. Please try again.'
      patch({ uploading: false, error: msg })
    }
  }, [isValid, state, selectedPlatforms, patch, onSuccess])

  const reset = useCallback(() => {
    if (prevPreviewUrl.current) URL.revokeObjectURL(prevPreviewUrl.current)
    prevPreviewUrl.current = null
    setState({ ...INITIAL_STATE, platforms: buildInitialPlatforms() })
  }, [])

  return {
    ...state,
    selectedPlatforms,
    isValid,
    setFile,
    clearFile,
    setCaption,
    togglePlatform,
    submit,
    reset,
  }
}
