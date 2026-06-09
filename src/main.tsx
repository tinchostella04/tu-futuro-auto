import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/fonts.css'
import '../src/styles/theme.css'
import App from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
