import { createBrowserRouter } from 'react-router'
import NotFound from '@/pages/error/404'
import Explore from '@/pages/explore'
import SplashScreen from '@/pages/splashScreen'

/** Routes */
export const routes = [
  {
    path: '/',
    element: <SplashScreen />,
  },
  {
    path: '/explore',
    element: <Explore />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]

/** Router */
export const router = createBrowserRouter(routes)
