import type { RouteObject } from 'react-router'
import { createBrowserRouter } from 'react-router'
import NotFound from '@/pages/error/404'
import { ErrorElement } from '@/pages/error/ErrorElement'
import Explore from '@/pages/explore'
import SplashScreen from '@/pages/splashScreen/page'

/** Routes */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <SplashScreen />,
    errorElement: <ErrorElement />,
  },
  {
    path: '/explore',
    element: (
      <Explore />
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]

/** Router */
export const router = createBrowserRouter(routes)
