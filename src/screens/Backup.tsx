import { useState, type ChangeEvent } from 'react'
import { Header } from '../components/common'
import { plural } from '../util'
import { href } from '../router'
import { parseBackup, type Store } from '../store'
import { getTheme, setTheme, type Theme } from '../theme'

const THEMES: [Theme, string][] = [
  ['dark', 'Dark'],
  ['light', 'Light'],
  ['auto', 'Match phone'],
]

export function Backup({ store }: { store: Store }) {
  const [message, setMessage] = useState('')
  const [theme, setThemeState] = useState(getTheme)
  const { books, words } = store.data

  function exportData() {
    const blob = new Blob([JSON.stringify(store.data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `booktionary-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function importData(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const data = parseBackup(await file.text())
      if (!confirm(`Replace everything here with ${plural(data.books.length, 'book')} and ${plural(data.words.length, 'word')} from the backup?`)) return
      store.replaceAll(data)
      setMessage('Backup restored.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not read that file.')
    }
  }

  return (
    <>
      <Header title="Settings" back={href({ name: 'home', tab: 'current' })} />
      <main className="page stack">
        <h2 className="settings-heading">Appearance</h2>
        <div className="theme-picker" role="group" aria-label="Appearance">
          {THEMES.map(([value, label]) => (
            <button
              key={value}
              aria-pressed={theme === value}
              onClick={() => {
                setTheme(value)
                setThemeState(value)
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <h2 className="settings-heading">Backup</h2>
        <p>
          Your {plural(books.length, 'book')} and {plural(words.length, 'word')} are saved on this device only. Download a
          backup now and then so you don't lose them if you clear your browser or switch phones.
        </p>
        <button className="button wide" onClick={exportData}>
          Download backup
        </button>
        <label className="button secondary wide file-button">
          Restore from a backup
          <input type="file" accept="application/json,.json" onChange={importData} />
        </label>
        {message && <p className="notice">{message}</p>}
      </main>
    </>
  )
}
