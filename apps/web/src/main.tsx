import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

/**
 * @description Import inconsolata font source
 * @description Supports weights 200-900
 */
// @ts-expect-error - Font package not installed, ignoring missing module error
import '@fontsource-variable/inconsolata'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
