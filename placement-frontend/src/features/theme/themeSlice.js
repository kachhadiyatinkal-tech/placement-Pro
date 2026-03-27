import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'theme'

function applyThemeClass(theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
}

function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return 'dark'
}

const initialState = {
  mode: getInitialTheme(),
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    initTheme(state) {
      state.mode = getInitialTheme()
      applyThemeClass(state.mode)
    },
    setTheme(state, action) {
      const mode = action.payload
      state.mode = mode
      localStorage.setItem(STORAGE_KEY, mode)
      applyThemeClass(mode)
    },
    toggleTheme(state) {
      const next = state.mode === 'dark' ? 'light' : 'dark'
      state.mode = next
      localStorage.setItem(STORAGE_KEY, next)
      applyThemeClass(next)
    },
  },
})

export const { initTheme, setTheme, toggleTheme } = themeSlice.actions
export default themeSlice.reducer

