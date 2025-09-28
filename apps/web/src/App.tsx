import type { FC } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { RouterProvider } from 'react-router'
import router from './router'

const App: FC = () => {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <div>{error.message}</div>}
      onReset={() => {
        window.location.reload()
      }}
    >
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}

export default App
