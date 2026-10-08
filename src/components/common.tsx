import type { CSSProperties, ReactNode } from 'react'
import type { Book, SavedWord } from '../types'
import { bookColor, posClass } from '../util'

export function Header({ title, back, action }: { title: string; back?: string; action?: ReactNode }) {
  return (
    <header className="header">
      {back ? (
        <a className="header-back" href={back} aria-label="Back">
          ‹
        </a>
      ) : (
        <span className="header-back" />
      )}
      <h1 className="header-title">{title}</h1>
      <span className="header-action">{action}</span>
    </header>
  )
}

export function Cover({ book, size = 'md' }: { book: Pick<Book, 'title' | 'coverUrl'>; size?: 'sm' | 'md' | 'lg' }) {
  if (book.coverUrl) {
    return <img className={`cover cover-${size}`} src={book.coverUrl} alt="" loading="lazy" />
  }
  return (
    <div className={`cover cover-${size} cover-blank`} style={{ '--book': bookColor(book.title) } as CSSProperties} aria-hidden="true">
      <span>{book.title}</span>
    </div>
  )
}

export function Meanings({ meanings }: { meanings: SavedWord['meanings'] }) {
  return (
    <div className="meanings">
      {meanings.map((m) => (
        <div key={m.partOfSpeech} className="meaning">
          <span className={`pos ${posClass(m.partOfSpeech)}`}>{m.partOfSpeech}</span>
          <ol>
            {m.definitions.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  )
}
