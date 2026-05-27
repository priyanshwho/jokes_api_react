import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { JokePresentation } from '../types'
import { formatCategory } from '../utils/jokes'

type JokeCardProps = {
  joke: JokePresentation
  isFavorite: boolean
  onToggleFavorite: () => void
  onCopy: () => void
  onShare: () => void
}

export function JokeCard({
  joke,
  isFavorite,
  onToggleFavorite,
  onCopy,
  onShare,
}: JokeCardProps) {
  const [liked, setLiked] = useState(false)

  return (
    <motion.article
      key={joke.id}
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.985 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="overflow-hidden rounded-[32px] border border-white/70 bg-[var(--surface-strong)] shadow-[var(--shadow)] backdrop-blur-xl"
    >
      <div className="relative overflow-hidden p-5 sm:p-7">
        <div className="absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full bg-[rgba(212,106,140,0.12)] blur-3xl" />
        <div className="absolute bottom-[-28px] left-[-18px] h-36 w-36 rounded-full bg-[rgba(96,165,250,0.11)] blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <motion.div
                animate={liked ? { rotate: [0, -6, 6, 0], scale: [1, 1.08, 0.98, 1] } : undefined}
                transition={{ duration: 0.35 }}
                className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[var(--accent-soft)] text-2xl"
              >
                {joke.emoji}
              </motion.div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
                  {formatCategory(joke.categories[0] ?? 'general')}
                </p>
                <h2 className="font-[family-name:var(--font-heading)] text-3xl leading-tight text-[var(--text)] sm:text-4xl">
                  {joke.title}
                </h2>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setLiked((current) => !current)
              onToggleFavorite()
            }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              isFavorite
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--line)] bg-white/80 text-[var(--text)] hover:bg-white'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isFavorite ? 'filled' : 'outline'}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {isFavorite ? '♥' : '♡'}
              </motion.span>
            </AnimatePresence>
            {isFavorite ? 'Saved' : 'Favorite'}
          </button>
        </div>

        <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[26px] border border-[var(--line)] bg-white/70 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              Setup
            </p>
            <p className="text-base leading-7 text-[var(--text)]">{joke.setup}</p>
          </div>
          <div className="rounded-[26px] border border-[var(--line)] bg-[rgba(255,246,239,0.85)] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              Punchline
            </p>
            <p className="text-base leading-7 text-[var(--text)]">{joke.punchline}</p>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2">
          {(joke.categories.length ? joke.categories : ['general']).map((category) => (
            <span
              key={category}
              className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-[var(--muted)]"
            >
              {formatCategory(category)}
            </span>
          ))}
          <span className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
            Joke #{joke.rawId}
          </span>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCopy}
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text)] transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Copy joke
          </button>
          <button
            type="button"
            onClick={onShare}
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text)] transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Share joke
          </button>
        </div>
      </div>
    </motion.article>
  )
}
