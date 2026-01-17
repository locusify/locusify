import type { FC } from 'react'
import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Spinner } from '@/components/ui/spinner'

const Layout: FC = () => {
  return (
    <div className="h-dvh flex flex-col">
      <Suspense fallback={<Spinner />}>
        <Outlet />
      </Suspense>
    </div>
  )
}

export default Layout
