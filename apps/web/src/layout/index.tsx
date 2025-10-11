import type { FC } from 'react'
import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Spinner } from '@/components/ui/spinner'
import Navbar from './components/navbar'

const Layout: FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <main className="flex-1 overflow-auto shrink-0">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Navbar />
    </div>
  )
}

export default Layout
