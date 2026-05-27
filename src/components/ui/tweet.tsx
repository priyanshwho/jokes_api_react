import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

interface TweetProps {
  id?: string
  authorName?: string
  handle?: string
  avatarUrl?: string
  text?: string
  className?: string
  showDate?: boolean
  showLikeButton?: boolean
  showCopyLink?: boolean
  createdAt?: string
  likes?: number
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return `${num}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString([], {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function Tweet({
  id = 'jokesphere-tweet',
  authorName = 'JokeSphere',
  handle = '@jokesphere',
  avatarUrl = 'https://unavatar.io/twitter/jokes',
  text = 'A joke in tweet form will appear here.',
  className,
  showDate = true,
  showLikeButton = true,
  showCopyLink = true,
  createdAt = new Date().toISOString(),
  likes = 2847,
}: TweetProps) {
  const [isCopied, setIsCopied] = useState(false)

  const tweetDate = useMemo(() => formatDate(createdAt), [createdAt])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(text).catch(() => {})
    setIsCopied(true)
    window.setTimeout(() => setIsCopied(false), 1500)
  }

  return (
    <article
      className={cn(
        'w-full rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[var(--shadow)] backdrop-blur-xl',
        className,
      )}
      aria-label="Tweet preview"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={avatarUrl} alt={authorName} className="h-11 w-11 rounded-full object-cover" />
          <div className="leading-tight">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--text)]">
              {authorName}
              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                verified-ish
              </span>
            </div>
            <div className="text-[13px] text-[var(--muted)]">{handle}</div>
          </div>
        </div>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--accent)]">
          share card
        </span>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-[16px] leading-7 text-[var(--text)] sm:text-[17px]">
        {text}
      </p>

      {showDate || showLikeButton || showCopyLink ? (
        <div className="mt-4 border-t border-[var(--line)] pt-3">
          {showDate ? (
            <time className="block text-sm text-[var(--muted)]" dateTime={createdAt}>
              {tweetDate}
            </time>
          ) : null}

          <div className="mt-3 flex items-center gap-4 text-sm text-[var(--muted)]">
            {showLikeButton ? (
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true">♥</span>
                <span>{formatNumber(likes)}</span>
              </span>
            ) : null}

            {showCopyLink ? (
              <button type="button" onClick={handleCopyLink} className="inline-flex items-center gap-1.5">
                <span aria-hidden="true">{isCopied ? '✓' : '↗'}</span>
                <span>{isCopied ? 'Copied' : 'Copy joke'}</span>
              </button>
            ) : null}

            <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--accent)]">#{id}</span>
          </div>
        </div>
      ) : null}
    </article>
  )
}
