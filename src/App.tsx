import { useRoute } from './router'
import { AddBook } from './screens/AddBook'
import { Backup } from './screens/Backup'
import { BookPage } from './screens/BookPage'
import { Home } from './screens/Home'
import { Quiz } from './screens/Quiz'
import { Review } from './screens/Review'
import { WordPage } from './screens/WordPage'
import { useStore } from './store'

export default function App() {
  const store = useStore()
  const route = useRoute()
  const { books, words } = store.data

  switch (route.name) {
    case 'addBook':
      return <AddBook store={store} />
    case 'backup':
      return <Backup store={store} />
    case 'quiz':
      return <Quiz key={route.bookId} store={store} bookId={route.bookId} />
    case 'book':
    case 'word':
    case 'review': {
      const book = books.find((b) => b.id === route.bookId)
      if (!book) break
      if (route.name === 'book') return <BookPage key={book.id} store={store} book={book} />
      if (route.name === 'review') return <Review book={book} words={words.filter((w) => w.bookId === book.id)} />
      const word = words.find((w) => w.id === route.wordId)
      if (word) return <WordPage store={store} book={book} word={word} />
      break
    }
    case 'home':
      return <Home store={store} tab={route.tab} />
  }
  return <Home store={store} tab="current" />
}
