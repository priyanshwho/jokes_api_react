export type JokeApiItem = {
  id: number
  content: string
  categories?: string[]
}

export type JokePresentation = {
  id: string
  rawId: number
  title: string
  setup: string
  punchline: string
  categories: string[]
  emoji: string
  content: string
}
