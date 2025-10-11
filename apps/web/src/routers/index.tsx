import type { RouteObject } from 'react-router'
import { createBrowserRouter } from 'react-router'
import Layout from '@/layout'
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
    element: <Layout />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: '/explore',
        element: <Explore />,
      },
      {
        path: '/add',
        element: <div>Add Page</div>,
      },
      {
        path: '/profile',
        element: <div>Profile Page</div>,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]

/** Router */
export const router = createBrowserRouter(routes)
