import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ActionButtons } from '../components/ActionButtons'
import { JokeCard } from '../components/JokeCard'
import { Loader } from '../components/Loader'
import { Navbar } from '../components/Navbar'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { HandWrittenTitle } from '../components/ui/hand-writing-text'
import { MouseFollowingEyes } from '../components/ui/mouse-following-eyes'
import { Perspective } from '../components/ui/perspective-highlight'
import { Tweet } from '../components/ui/tweet'
import '../App.css'
import {
  buildJokePresentation,
  createShareText,
  fetchRandomJokes,
  getFallbackCategories,
  pickRandom,
  shortenText,
} from '../utils/jokes'
import type { JokePresentation } from '../types'

const HISTORY_LIMIT = 6

function dedupeById(items: JokePresentation[]) {
  const seen = new Set<number>()

  return items.filter((item) => {
    if (seen.has(item.rawId)) {
      return false
    }

    seen.add(item.rawId)
    return true
  })
}

export function Home() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('jokesphere-theme', () => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  })
  const [currentJoke, setCurrentJoke] = useState<JokePresentation | null>(null)
  const [favorites, setFavorites] = useLocalStorage<JokePresentation[]>('jokesphere-favorites', [])
  const [history, setHistory] = useLocalStorage<JokePresentation[]>('jokesphere-history', [])
  const [seenJokeIds, setSeenJokeIds] = useLocalStorage<number[]>('jokesphere-seen-jokes', [])
  const [shuffleMode, setShuffleMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [transitionId, setTransitionId] = useState(0)
  const toastTimer = useRef<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const seenJokeSet = useMemo(() => new Set(seenJokeIds), [seenJokeIds])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    void loadFreshJoke()

    return () => {
      abortControllerRef.current?.abort()

      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current)
      }
    }
  }, [])

  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.rawId)), [favorites])

  async function loadFreshJoke() {
    setIsLoading(true)
    setError(null)

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const nextJoke = await findFreshJoke(controller.signal)

      setSeenJokeIds((previous) => {
        if (previous.includes(nextJoke.rawId)) {
          return previous
        }

        return [nextJoke.rawId, ...previous].slice(0, 120)
      })

      setCurrentJoke(nextJoke)
      setHistory((previous) =>
        dedupeById([nextJoke, ...previous]).slice(0, HISTORY_LIMIT),
      )
      setTransitionId((value) => value + 1)
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Something blocked the joke stream.'
      setError(message)
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
      }
    }
  }

  async function findFreshJoke(signal?: AbortSignal) {
    const maxAttempts = 4

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const jokes = await fetchRandomJokes(signal)
      const candidates = jokes
        .map((joke) => buildJokePresentation(joke))
        .filter((joke) => !seenJokeSet.has(joke.rawId))

      if (candidates.length > 0) {
        return pickRandom(candidates)
      }
    }

    const fallbackBatch = await fetchRandomJokes(signal)
    const fallbackCandidates = fallbackBatch.map((joke) => buildJokePresentation(joke))

    return pickRandom(fallbackCandidates)
  }

  function showToast(message: string) {
    setToast(message)

    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current)
    }

    toastTimer.current = window.setTimeout(() => {
      setToast(null)
    }, 2200)
  }

  function handleGenerate() {
    if (shuffleMode && history.length > 1) {
      const shuffledCandidates = history.filter((joke) => joke.rawId !== currentJoke?.rawId)
      const shuffledJoke = pickRandom(shuffledCandidates.length > 0 ? shuffledCandidates : history)
      setCurrentJoke(shuffledJoke)
      setTransitionId((value) => value + 1)
      showToast('Shuffled from your history')
      return
    }

    void loadFreshJoke()
  }

  function handleCopy() {
    if (!currentJoke) {
      return
    }

    void navigator.clipboard
      .writeText(createShareText(currentJoke))
      .then(() => showToast('Joke copied to clipboard'))
      .catch(() => showToast('Clipboard access was blocked'))
  }

  async function handleShare() {
    if (!currentJoke) {
      return
    }

    const shareText = createShareText(currentJoke)

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'JokeSphere',
          text: shareText,
        })
        showToast('Joke ready to share')
        return
      } catch {
        await navigator.clipboard.writeText(shareText)
        showToast('Sharing was cancelled, so the joke was copied instead')
        return
      }
    }

    void navigator.clipboard
      .writeText(shareText)
      .then(() => showToast('Sharing is unavailable, so the joke was copied instead'))
      .catch(() => showToast('Clipboard access was blocked'))
  }

  function handleToggleFavorite() {
    if (!currentJoke) {
      return
    }

    setFavorites((previous) => {
      const alreadySaved = previous.some((item) => item.rawId === currentJoke.rawId)

      if (alreadySaved) {
        showToast('Removed from favorites')
        return previous.filter((item) => item.rawId !== currentJoke.rawId)
      }

      showToast('Added to favorites')
      return [currentJoke, ...previous].slice(0, 12)
    })
  }

  function handleRestoreJoke(joke: JokePresentation) {
    setCurrentJoke(joke)
    setTransitionId((value) => value + 1)
  }

  function handleClearHistory() {
    setHistory([])
    showToast('History cleared')
  }

  const displayCategories = currentJoke ? getFallbackCategories(currentJoke) : []
  const isInitialLoad = isLoading && !currentJoke && !error

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,236,130,0.35),_transparent_26%),radial-gradient(circle_at_80%_10%,_rgba(143,211,255,0.28),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(255,212,97,0.2),_transparent_24%)]" />
      <div className="pointer-events-none absolute left-10 top-24 h-36 w-36 rounded-full bg-[rgba(255,255,255,0.5)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-12 h-44 w-44 rounded-full bg-[rgba(143,211,255,0.18)] blur-3xl" />

      {isInitialLoad ? (
        <main className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
            <MouseFollowingEyes className="w-44 sm:w-52" />
          </div>
          <div className="w-full max-w-5xl rounded-[36px] border border-white/70 bg-[var(--surface)] px-6 py-10 shadow-[var(--shadow)] backdrop-blur-xl sm:px-10 sm:py-16">
            <HandWrittenTitle
              title="JokeSphere"
              subtitle="Dusting off a fresh laugh before the main page opens."
            />
          </div>
        </main>
      ) : null}

      <main className={`relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8 ${isInitialLoad ? 'hidden' : 'flex'}`}>
        <Navbar
          theme={theme}
          savedCount={favorites.length}
          historyCount={history.length}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(290px,0.85fr)]">
          <div className="space-y-5">
            <ActionButtons
              isGenerating={isLoading}
              shuffleMode={shuffleMode}
              hasHistory={history.length > 0}
              onGenerate={handleGenerate}
              onToggleShuffle={() => setShuffleMode((value) => !value)}
              onClearHistory={handleClearHistory}
            />

            {isLoading ? (
              <Loader />
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[30px] border border-rose-200/60 bg-[var(--surface-strong)] p-6 shadow-[var(--shadow)] backdrop-blur-xl"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-500">
                  Fetch failed
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl text-[var(--text)]">
                  The joke machine tripped over itself.
                </h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-[var(--muted)]">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="mt-5 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Try again
                </button>
              </motion.div>
            ) : currentJoke ? (
              <Perspective className="relative">
                <AnimatePresence mode="wait">
                  <JokeCard
                    key={transitionId}
                    joke={currentJoke}
                    isFavorite={favoriteIds.has(currentJoke.rawId)}
                    onToggleFavorite={handleToggleFavorite}
                    onCopy={handleCopy}
                    onShare={() => {
                      void handleShare()
                    }}
                  />
                </AnimatePresence>
              </Perspective>
            ) : null}

            {currentJoke ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-[24px] border border-white/60 bg-[var(--surface)] p-4 shadow-[var(--shadow)] backdrop-blur-xl"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Current vibe
                  </p>
                  <p className="mt-2 text-base font-medium text-[var(--text)]">
                    {currentJoke.emoji} {shortenText(currentJoke.title, 44)}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-[24px] border border-white/60 bg-[var(--surface)] p-4 shadow-[var(--shadow)] backdrop-blur-xl"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Tags
                  </p>
                  <p className="mt-2 text-base font-medium text-[var(--text)]">
                    {displayCategories.map((category) => category).join(' · ')}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-[24px] border border-white/60 bg-[var(--surface)] p-4 shadow-[var(--shadow)] backdrop-blur-xl"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Saved laughs
                  </p>
                  <p className="mt-2 text-base font-medium text-[var(--text)]">
                    {favorites.length} favorites stored locally
                  </p>
                </motion.div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4">
            {currentJoke ? (
              <Tweet
                id={`joke-${currentJoke.rawId}`}
                authorName="JokeSphere"
                handle="@jokesphere"
                text={createShareText(currentJoke)}
                likes={(currentJoke.rawId * 37) % 5000 + 128}
                className="border-[var(--line)] bg-[var(--surface-strong)]"
              />
            ) : null}

            <div className="rounded-[30px] border border-white/60 bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
                    Favorites
                  </p>
                  <h3 className="mt-1 font-[family-name:var(--font-heading)] text-2xl text-[var(--text)]">
                    Saved jokes
                  </h3>
                </div>
                <span className="rounded-full border border-[var(--line)] bg-white/75 px-3 py-1 text-xs font-medium text-[var(--muted)]">
                  {favorites.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {favorites.length > 0 ? (
                  favorites.map((joke) => (
                    <button
                      key={joke.id}
                      type="button"
                      onClick={() => handleRestoreJoke(joke)}
                      className="w-full rounded-[22px] border border-[var(--line)] bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                            {joke.emoji}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                            {shortenText(joke.title, 50)}
                          </p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {shortenText(joke.punchline, 82)}
                          </p>
                        </div>
                        <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                          saved
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-white/50 p-5 text-sm leading-6 text-[var(--muted)]">
                    Tap the heart on any joke to save it here. Your list stays in localStorage.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/60 bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
                    History
                  </p>
                  <h3 className="mt-1 font-[family-name:var(--font-heading)] text-2xl text-[var(--text)]">
                    Joke trail
                  </h3>
                </div>
                <span className="rounded-full border border-[var(--line)] bg-white/75 px-3 py-1 text-xs font-medium text-[var(--muted)]">
                  {history.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {history.length > 0 ? (
                  history.map((joke) => (
                    <button
                      key={joke.id}
                      type="button"
                      onClick={() => handleRestoreJoke(joke)}
                      className="w-full rounded-[22px] border border-[var(--line)] bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                        {joke.categories[0] ?? 'general'}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                        {shortenText(joke.title, 56)}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {shortenText(joke.setup, 72)}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-white/50 p-5 text-sm leading-6 text-[var(--muted)]">
                    Generated jokes will appear here so you can revisit the good ones.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </section>
      </main>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/60 bg-[var(--surface-strong)] px-5 py-3 text-sm font-medium text-[var(--text)] shadow-[var(--shadow)] backdrop-blur-xl"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
