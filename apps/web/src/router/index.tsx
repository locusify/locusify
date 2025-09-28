import { createBrowserRouter } from 'react-router'
import SplashScreen from '@/pages/splashScreen'
import Workspace from '@/pages/workspace'

/** Routes */
export const routes = [
  {
    path: '/',
    element: <SplashScreen />,
  },
  {
    path: '/workspace',
    element: <Workspace />,
  },
]

/** Router */
export const router = createBrowserRouter(routes)
