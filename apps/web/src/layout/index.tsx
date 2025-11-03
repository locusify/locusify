import type { FC } from 'react'
import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Spinner } from '@/components/ui/spinner'
import ProtectedRoute from './components/ProtectedRoute'

const Layout: FC = () => {
  return (
    <ProtectedRoute>
      <div className="h-dvh flex flex-col overflow-hidden">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}

export default Layout
