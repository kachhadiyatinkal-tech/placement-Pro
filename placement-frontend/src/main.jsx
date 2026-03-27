import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store'
import { initTheme } from './features/theme/themeSlice'
import { getCurrentUser } from './features/auth/authSlice'

store.dispatch(initTheme())
const token = localStorage.getItem('token')
const role = localStorage.getItem('role')
if (token && role !== 'company') {
  store.dispatch(getCurrentUser())
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
