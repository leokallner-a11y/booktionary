import { useEffect, useState } from 'react'

// Hash routes keep the app working as plain static files on any host.
export type Route =
  | { name: 'home'; tab: 'current' | 'past' }
  | { name: 'addBook' }
  | { name: 'book'; bookId: string }
  | { name: 'word'; bookId: string; wordId: string }
  | { name: 'review'; bookId: string }
  | { name: 'quiz'; bookId: string } // bookId 'all' quizzes every book
  | { name: 'backup' }

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  switch (parts[0]) {
    case 'past':
      return { name: 'home', tab: 'past' }
    case 'add':
      return { name: 'addBook' }
    case 'book':
      if (parts[1] && parts[2] === 'word' && parts[3]) return { name: 'word', bookId: parts[1], wordId: parts[3] }
      if (parts[1] && parts[2] === 'review') return { name: 'review', bookId: parts[1] }
      if (parts[1]) return { name: 'book', bookId: parts[1] }
      break
    case 'quiz':
      return { name: 'quiz', bookId: parts[1] ?? 'all' }
    case 'backup':
      return { name: 'backup' }
  }
  return { name: 'home', tab: 'current' }
}

export function href(route: Route): string {
  switch (route.name) {
    case 'home':
      return route.tab === 'past' ? '#/past' : '#/'
    case 'addBook':
      return '#/add'
    case 'book':
      return `#/book/${route.bookId}`
    case 'word':
      return `#/book/${route.bookId}/word/${route.wordId}`
    case 'review':
      return `#/book/${route.bookId}/review`
    case 'quiz':
      return `#/quiz/${route.bookId}`
    case 'backup':
      return '#/backup'
  }
}

export function navigate(route: Route, replace = false) {
  if (replace) location.replace(href(route))
  else location.hash = href(route)
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
