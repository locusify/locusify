import { createBrowserRouter } from 'react-router'
import { env } from '@/lib/env'
import SplashScreen from '@/pages/splashScreen'

/** Base URL for frontend */
const basename = env.BASE_URL

/** Routes */
export const routes = [
  {
    path: '/',
    element: <SplashScreen />,
  },
]

/** Router */
export const router = createBrowserRouter(routes, { basename })
