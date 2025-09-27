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

/**
 * @description Start react-scan in development mode
 */
if (import.meta.env.DEV) {
  /**
   * react-scan is a development tool that helps you visualize the component tree and the props of each component.
   */
  const { start } = await import('react-scan')
  start()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
