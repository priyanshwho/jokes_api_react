import type { JokeApiItem, JokePresentation } from '../types'

const JOKE_API_URL = 'https://api.freeapi.app/api/v1/public/randomjokes'

const EMOJI_POOL = ['✨', '🍓', '🫧', '🪄', '🌙', '🎈', '🍑', '🌸']

function trimText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getCategoryLabel(categories: string[]) {
  if (!categories.length) {
    return 'General'
  }

  return categories
    .slice(0, 2)
    .map((category) => capitalize(category.replace(/[-_]/g, ' ')))
    .join(' · ')
}

function makeTitle(content: string, categories: string[]) {
  const firstSentence = content.match(/^[^.!?]+[.!?]?/)
  const sentence = trimText(firstSentence?.[0] ?? content)
  const titleCandidate = sentence.split(/\s+/).slice(0, 10).join(' ')

  if (titleCandidate.length >= 20) {
    return titleCandidate.replace(/[\s:;,-]+$/g, '')
  }

  return `${getCategoryLabel(categories)} Joke`
}

function splitContent(content: string) {
  const separators = [' — ', ' -- ', ' - ', ': ', '; ', ' | ']

  for (const separator of separators) {
    const index = content.indexOf(separator)

    if (index > 20) {
      return {
        setup: trimText(content.slice(0, index)),
        punchline: trimText(content.slice(index + separator.length)),
      }
    }
  }

  const sentenceMatch = content.match(/^(.+?[.!?])\s+(.+)$/)

  if (sentenceMatch) {
    return {
      setup: trimText(sentenceMatch[1]),
      punchline: trimText(sentenceMatch[2]),
    }
  }

  const words = content.split(/\s+/)

  return {
    setup: trimText(words.slice(0, Math.min(10, words.length)).join(' ')),
    punchline: trimText(content),
  }
}

export function buildJokePresentation(joke: JokeApiItem): JokePresentation {
  const categories = joke.categories ?? []
  const content = trimText(joke.content)
  const parts = splitContent(content)

  return {
    id: `joke-${joke.id}`,
    rawId: joke.id,
    title: makeTitle(content, categories),
    setup: parts.setup,
    punchline: parts.punchline,
    categories,
    emoji: EMOJI_POOL[joke.id % EMOJI_POOL.length],
    content,
  }
}

export async function fetchRandomJokes(signal?: AbortSignal) {
  const response = await fetch(JOKE_API_URL, { signal })

  if (!response.ok) {
    throw new Error(`Unable to fetch jokes (${response.status})`)
  }

  const payload = (await response.json()) as {
    data?: {
      data?: JokeApiItem[]
    }
    message?: string
  }

  const jokes = payload.data?.data

  if (!Array.isArray(jokes) || jokes.length === 0) {
    throw new Error(payload.message ?? 'The joke feed came back empty.')
  }

  return jokes
}

export function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

export function formatCategory(category: string) {
  return capitalize(category.replace(/[-_]/g, ' '))
}

export function getFallbackCategories(joke: JokePresentation) {
  return joke.categories.length ? joke.categories : ['general']
}

export function createShareText(joke: JokePresentation) {
  return [joke.title, joke.setup, joke.punchline, 'Shared from JokeSphere'].join('\n\n')
}

export function shortenText(value: string, maxLength = 88) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`
}
