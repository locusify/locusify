import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { reactQueryClient } from '@/lib/query-client'
import App from './App'
/** Initialize */
import initialize from './lib/initialize'
/**
 * @description Import inconsolata font source
 * @description Supports weights 200-900
 */
// @ts-expect-error - Font package not installed, ignoring missing module error
import '@fontsource-variable/inconsolata'
import './index.css'

initialize().finally(() => createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={reactQueryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
))
