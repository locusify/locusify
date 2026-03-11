import type { FC } from 'react'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import { ThemeProvider } from 'next-themes'
import { useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { RouterProvider } from 'react-router'
import { Toaster } from './components/ui/sonner'
import { TooltipProvider } from './components/ui/tooltip'
import { isNative, onDeepLink } from './platforms'
import { router } from './routers'
import { handleOAuthCallback } from './stores/authStore'

const App: FC = () => {
  // Register deep link handler for native OAuth callback
  useEffect(() => {
    if (!isNative())
      return

    const unsubscribe = onDeepLink((url) => {
      // Handle OAuth callback: locusify://auth/callback?access_token=...&refresh_token=...
      if (url.hostname === 'auth' && url.pathname === '/callback') {
        const accessToken = url.searchParams.get('access_token')
        const refreshToken = url.searchParams.get('refresh_token')

        if (accessToken && refreshToken) {
          handleOAuthCallback(accessToken, refreshToken)
            .then(() => router.navigate('/map', { replace: true }))
            .catch(err => console.error('OAuth callback failed:', err))
        }
      }
    })

    return unsubscribe
  }, [])

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem disableTransitionOnChange>
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
              <Toaster />
            </TooltipProvider>
          </ErrorBoundary>
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  )
}

export default App
