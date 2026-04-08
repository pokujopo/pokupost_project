/**
 * pages/CreatePostPage.jsx
 *
 * Sends real multipart upload to Django.
 * Shows actual Axios upload progress, then adds the created post to the feed.
 */

import { useOutletContext }               from 'react-router-dom'
import { useUpload }                      from '@/hooks/useUpload'
import PageHeader                         from '@/components/ui/PageHeader'
import InfoBanner                         from '@/components/ui/InfoBanner'
import Card, { CardHeader }               from '@/components/ui/Card'
import Button                             from '@/components/ui/Button'
import AlertBanner                        from '@/components/ui/AlertBanner'
import UploadZone, { FilePreview }        from '@/components/UploadZone'
import PlatformSelector                   from '@/components/PlatformSelector'
import ProgressBar                        from '@/components/ProgressBar'
import SuccessBanner                      from '@/components/SuccessBanner'

export default function CreatePostPage() {
  const { addPost } = useOutletContext()
  const upload      = useUpload((post) => addPost(post))

  return (
    <div>
      <PageHeader
        title="Create Post"
        subtitle="Upload once — publish everywhere automatically"
      />

      <InfoBanner>
        Upload a video or image, write your caption, select platforms, and ZynkPost handles the rest.
      </InfoBanner>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">

        {/* Left: media + caption */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Media Upload" />

            {upload.previewUrl ? (
              <FilePreview
                file={upload.media}
                previewUrl={upload.previewUrl}
                fileType={upload.fileType}
                onRemove={upload.clearFile}
              />
            ) : (
              <UploadZone onFile={upload.setFile} error={null} />
            )}

            {/* Caption */}
            <div className="mt-5">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                Caption
              </label>
              <textarea
                value={upload.caption}
                onChange={(e) => upload.setCaption(e.target.value)}
                maxLength={2200}
                rows={4}
                placeholder="Write something compelling about your content…"
                className="w-full resize-y rounded-xl border border-surface-border bg-white/[0.04]
                           px-4 py-3.5 font-body text-sm text-ink placeholder-ink-faint
                           outline-none transition-colors focus:border-brand/50 leading-relaxed"
              />
              <p className="mt-1.5 text-right text-[11px] text-ink-muted">
                {upload.caption.length}/2200
              </p>
            </div>

            {/* Real upload progress bar */}
            {upload.uploading && (
              <ProgressBar
                progress={upload.progress}
                label="Uploading to server…"
              />
            )}

            {/* Error */}
            {upload.error && (
              <AlertBanner
                type="error"
                message={upload.error}
                className="mt-4"
                onDismiss={() => upload.reset()}
              />
            )}

            {/* Success */}
            {upload.success && <SuccessBanner />}
          </Card>
        </div>

        {/* Right: platforms + submit */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Select Platforms" />
            <PlatformSelector
              selected={upload.platforms}
              onToggle={upload.togglePlatform}
            />
          </Card>

          <Card>
            <CardHeader title="Ready to Publish?" />

            <ul className="mb-5 flex flex-col gap-2 text-[13px]">
              <ChecklistItem done={!!upload.file}                    label="File selected"    />
              <ChecklistItem done={upload.caption.trim().length > 0} label="Caption written"  />
              <ChecklistItem done={upload.selectedPlatforms.length > 0} label="Platform chosen" />
            </ul>

            <Button
              variant="primary"
              size="lg"
              disabled={!upload.isValid || upload.uploading}
              onClick={upload.submit}
            >
              {upload.uploading
                ? `⏳ Uploading… ${upload.progress}%`
                : '🚀 Publish Now'}
            </Button>
          </Card>
        </div>

      </div>
    </div>
  )
}

function ChecklistItem({ done, label }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full
                    text-[10px] font-bold
                    ${done
                      ? 'bg-status-success-bg text-status-success'
                      : 'bg-white/[0.06] text-ink-faint'}`}
      >
        {done ? '✓' : '○'}
      </span>
      <span className={done ? 'text-ink' : 'text-ink-muted'}>{label}</span>
    </li>
  )
}
