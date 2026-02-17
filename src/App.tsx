import type { FC } from 'react'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import { ErrorBoundary } from 'react-error-boundary'
import { RouterProvider } from 'react-router'
import { TooltipProvider } from './components/ui/tooltip'
import { router } from './routers'

const App: FC = () => {
  return (
    <LazyMotion features={domAnimation} strict key="framer">
      <MotionConfig transition={{
        type: 'spring',
        duration: 0.4,
        bounce: 0,
      }}
      >
        <ErrorBoundary
          fallbackRender={({ error }) => <div>{error.message}</div>}
          onReset={() => {
            window.location.reload()
          }}
        >
          <TooltipProvider>
            <RouterProvider router={router} />
          </TooltipProvider>
        </ErrorBoundary>
      </MotionConfig>
    </LazyMotion>
  )
}

export default App
