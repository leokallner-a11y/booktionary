export type Theme = 'dark' | 'light' | 'auto'

// index.html applies the saved theme before the app loads, so there is no flash.
const THEME_KEY = 'booktionary:theme'

export function getTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'auto') return saved
  } catch {
    // Storage blocked: fall through to the default.
  }
  return 'dark'
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Still applies for this visit.
  }
}
