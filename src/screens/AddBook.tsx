import { useState, type FormEvent } from 'react'
import { searchBooks } from '../api'
import { Cover, Header } from '../components/common'
import { href, navigate } from '../router'
import type { Store } from '../store'
import type { BookResult } from '../types'

export function AddBook({ store }: { store: Store }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BookResult[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [manual, setManual] = useState(false)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')

  async function onSearch(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setError('')
    try {
      setResults(await searchBooks(query.trim()))
    } catch {
      setError("Couldn't reach the book search. Check your connection, or add the book by hand.")
    } finally {
      setSearching(false)
    }
  }

  function add(book: BookResult) {
    const created = store.addBook(book)
    navigate({ name: 'book', bookId: created.id }, true)
  }

  function onManual(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    add({ title: title.trim(), author: author.trim() || 'Unknown author' })
  }

  return (
    <>
      <Header title="Add a book" back={href({ name: 'home', tab: 'current' })} />
      <main className="page">
        {!manual ? (
          <>
            <form className="search-row" onSubmit={onSearch}>
              <input
                type="search"
                autoFocus
                placeholder="Title or author"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search for a book"
              />
              <button className="button" disabled={searching}>
                {searching ? '…' : 'Search'}
              </button>
            </form>
            {error && <p className="error">{error}</p>}
            {results && results.length === 0 && <p className="muted">No books found. Try another search.</p>}
            {results && results.length > 0 && (
              <ul className="book-list">
                {results.map((r, i) => (
                  <li key={i}>
                    <button className="book-card" onClick={() => add(r)}>
                      <Cover book={r} size="sm" />
                      <div>
                        <div className="book-title">{r.title}</div>
                        <div className="muted">{r.author}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button className="link" onClick={() => setManual(true)}>
              Can't find it? Type it in yourself
            </button>
          </>
        ) : (
          <form className="stack" onSubmit={onManual}>
            <label>
              Title
              <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label>
              Author
              <input value={author} onChange={(e) => setAuthor(e.target.value)} />
            </label>
            <button className="button wide" disabled={!title.trim()}>
              Add book
            </button>
            <button type="button" className="link" onClick={() => setManual(false)}>
              Back to search
            </button>
          </form>
        )}
      </main>
    </>
  )
}
