import type { RouteObject } from 'react-router'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import Layout from '@/layout'
import { ErrorElement } from '@/pages/error/ErrorElement'
import { Map } from '@/pages/map'
import SplashScreen from '@/pages/splashScreen/page'

const AuthCallback = lazy(() => import('@/pages/auth/AuthCallback'))

/** Routes */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <SplashScreen />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/auth/callback',
    element: (
      <Suspense fallback={null}>
        <AuthCallback />
      </Suspense>
    ),
  },
  {
    element: <Layout />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: '/map',
        element: <Map />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/map" replace />,
  },
]

/** Router */
export const router = createBrowserRouter(routes)
