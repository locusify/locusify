import { createBrowserRouter } from 'react-router'
import SplashScreen from '@/pages/splashScreen'

const router = createBrowserRouter([
  {
    path: '/',
    element: <SplashScreen />,
  },
])

export default router
