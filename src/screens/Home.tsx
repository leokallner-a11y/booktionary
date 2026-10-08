import { Cover, Header } from '../components/common'
import { plural } from '../util'
import { href } from '../router'
import type { Store } from '../store'

export function Home({ store, tab }: { store: Store; tab: 'current' | 'past' }) {
  const { books, words } = store.data
  const shown = books.filter((b) => b.status === tab)
  const countFor = (bookId: string) => words.filter((w) => w.bookId === bookId).length

  return (
    <>
      <Header
        title="Booktionary"
        action={
          <a className="icon-link" href={href({ name: 'backup' })} aria-label="Backup">
            ⋯
          </a>
        }
      />
      <main className="page">
        <nav className="tabs" role="tablist">
          <a role="tab" aria-selected={tab === 'current'} href={href({ name: 'home', tab: 'current' })}>
            Current Books
          </a>
          <a role="tab" aria-selected={tab === 'past'} href={href({ name: 'home', tab: 'past' })}>
            Past Books
          </a>
        </nav>

        {shown.length === 0 ? (
          <div className="empty">
            {tab === 'current' ? (
              <>
                <p>Add the book you're reading to start saving words.</p>
                <a className="button" href={href({ name: 'addBook' })}>
                  Add a book
                </a>
              </>
            ) : (
              <p>Books you finish will show up here.</p>
            )}
          </div>
        ) : (
          <ul className="book-list">
            {shown.map((b) => (
              <li key={b.id}>
                <a className="book-card" href={href({ name: 'book', bookId: b.id })}>
                  <Cover book={b} size="sm" />
                  <div>
                    <div className="book-title">{b.title}</div>
                    <div className="muted">{b.author}</div>
                    <div className="count">{plural(countFor(b.id), 'word')}</div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}

        {tab === 'current' && shown.length > 0 && (
          <a className="button secondary wide" href={href({ name: 'addBook' })}>
            + Add a book
          </a>
        )}

        {words.length >= 2 && (
          <a className="button secondary wide" href={href({ name: 'quiz', bookId: 'all' })}>
            Quiz me on all {words.length} words
          </a>
        )}
      </main>
    </>
  )
}
