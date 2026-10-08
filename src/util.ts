import type { SavedWord } from './types'

export function firstDefinition(word: Pick<SavedWord, 'meanings'>): string {
  return word.meanings[0]?.definitions[0] ?? ''
}

export function plural(n: number, one: string, many = one + 's') {
  return `${n} ${n === 1 ? one : many}`
}

export function playAudio(url?: string) {
  if (url) new Audio(url).play().catch(() => {})
}
