import { createBrowserRouter } from 'react-router'
import SplashScreen from '@/pages/splashScreen'

/** Routes */
export const routes = [
  {
    path: '/',
    element: <SplashScreen />,
  },
]

/** Router */
export const router = createBrowserRouter(routes)
