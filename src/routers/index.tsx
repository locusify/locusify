import type { RouteObject } from 'react-router'
import { createBrowserRouter, Navigate } from 'react-router'
import Layout from '@/layout'
import { ErrorElement } from '@/pages/error/ErrorElement'
import { Map } from '@/pages/map'
import SplashScreen from '@/pages/splashScreen/page'

/** Routes */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <SplashScreen />,
    errorElement: <ErrorElement />,
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
