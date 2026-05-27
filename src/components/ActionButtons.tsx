import { motion } from 'framer-motion'

type ActionButtonsProps = {
  isGenerating: boolean
  shuffleMode: boolean
  hasHistory: boolean
  onGenerate: () => void
  onToggleShuffle: () => void
  onClearHistory: () => void
}

export function ActionButtons({
  isGenerating,
  shuffleMode,
  hasHistory,
  onGenerate,
  onToggleShuffle,
  onClearHistory,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={onGenerate}
        className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(212,106,140,0.28)] transition disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isGenerating}
      >
        {isGenerating ? 'Brewing another one...' : 'Generate Another Joke'}
      </motion.button>

      <button
        type="button"
        onClick={onToggleShuffle}
        className={`rounded-full border px-4 py-3 text-sm font-medium transition ${
          shuffleMode
            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
            : 'border-[var(--line)] bg-white/75 text-[var(--text)] hover:bg-white'
        }`}
      >
        Shuffle mode {shuffleMode ? 'on' : 'off'}
      </button>

      <button
        type="button"
        onClick={onClearHistory}
        disabled={!hasHistory}
        className="rounded-full border border-[var(--line)] bg-white/75 px-4 py-3 text-sm font-medium text-[var(--text)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Clear history
      </button>
    </div>
  )
}
