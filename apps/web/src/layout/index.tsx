import type { FC } from 'react'
import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Spinner } from '@/components/ui/spinner'
import Navbar from './components/navbar'
import ProtectedRoute from './components/ProtectedRoute'

const Layout: FC = () => {
  return (
    <ProtectedRoute>
      <div className="h-dvh flex flex-col">
        <main className="flex-1 overflow-auto shrink-0">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </main>
        <Navbar />
      </div>
    </ProtectedRoute>
  )
}

export default Layout
