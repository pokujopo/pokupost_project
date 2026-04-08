import Button   from '@/components/ui/Button'
import Spinner  from '@/components/ui/Spinner'
import { PLATFORMS } from '@/data/platforms'
import { cn } from '@/utils/cn'

/**
 * @param {{
 *   account:    object,
 *   connecting: boolean,
 *   onToggle:   () => void,
 * }} props
 */
export default function AccountCard({ account, connecting, onToggle }) {
  const meta = PLATFORMS[account.platform]
  const platformBg = account.platform === 'YouTube' ? 'rgba(255,0,0,0.12)'
                   : account.platform === 'Facebook' ? 'rgba(24,119,242,0.12)'
                   : 'rgba(231,233,234,0.08)'

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border bg-surface-card p-6 animate-fade-up',
        'transition-all duration-200 hover:-translate-y-0.5',
        account.connected ? 'border-status-success/20' : 'border-surface-border',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px]
                     text-xl font-black"
          style={{ background: platformBg, color: meta?.color }}
        >
          {meta?.icon}
        </div>
        <div>
          <p className="font-display text-lg font-bold text-ink">{account.platform}</p>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                account.connected
                  ? 'bg-status-success shadow-[0_0_6px_#22C55E]'
                  : 'bg-ink-faint',
              )}
            />
            <span className={account.connected ? 'text-status-success' : 'text-ink-muted'}>
              {account.connected ? account.username : 'Not connected'}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-ink-muted">{account.description}</p>

      {/* Stats — only when connected */}
      {account.connected && (
        <div className="flex gap-5 rounded-xl bg-white/[0.03] px-4 py-3">
          <div className="text-center">
            <p
              className="font-display text-xl font-extrabold"
              style={{ color: meta?.color }}
            >
              {account.posts}
            </p>
            <p className="text-[11px] font-medium text-ink-muted">Posts</p>
          </div>
          <div className="text-center">
            <p
              className="font-display text-xl font-extrabold"
              style={{ color: meta?.color }}
            >
              {account.followers}
            </p>
            <p className="text-[11px] font-medium text-ink-muted">Followers</p>
          </div>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={onToggle}
        disabled={connecting}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl border py-3',
          'font-display text-[14px] font-bold transition-all duration-200 disabled:opacity-60',
          account.connected
            ? 'border-status-failed/20 bg-status-failed-bg text-status-failed hover:bg-status-failed/20'
            : 'border-brand/25 bg-brand-faint text-brand hover:bg-brand hover:text-white',
        )}
      >
        {connecting ? (
          <>
            <Spinner />
            Connecting to {account.platform}…
          </>
        ) : account.connected ? (
          '🔌 Disconnect'
        ) : (
          `⚡ Connect ${account.platform}`
        )}
      </button>
    </div>
  )
}
