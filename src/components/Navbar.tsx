import { motion } from 'framer-motion'

type NavbarProps = {
  theme: 'light' | 'dark'
  savedCount: number
  historyCount: number
  onToggleTheme: () => void
}

export function Navbar({
  theme,
  savedCount,
  historyCount,
  onToggleTheme,
}: NavbarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex flex-col gap-4 rounded-[32px] border border-white/60 bg-[var(--surface)] px-5 py-4 shadow-[var(--shadow)] backdrop-blur-xl sm:px-6 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
          JokeSphere
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl leading-none text-[var(--text)] sm:text-4xl">
            A playful joke browser with personality
          </h1>
          <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1 text-xs font-medium text-[var(--muted)] backdrop-blur">
            Fresh laughs, saved locally
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-full border border-[var(--line)] bg-white/75 px-4 py-2 text-sm text-[var(--muted)] backdrop-blur">
          {historyCount} in history · {savedCount} saved
        </div>
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        </button>
      </div>
    </motion.header>
  )
}
