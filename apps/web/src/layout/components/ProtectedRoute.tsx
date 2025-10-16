import type { FC, ReactNode } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Spinner } from '@/components/ui/spinner'
import { useAuthState } from '@/hooks/useAuthState'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Protected Route Component
 * 权限验证组件，确保用户已登录才能访问受保护的页面
 * 如果未登录，自动跳转到首页
 */
const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate()
  const { hasSession, isReady } = useAuthState()

  useEffect(() => {
    // 等待认证状态就绪
    if (!isReady)
      return

    // 如果未登录，跳转到首页
    if (!hasSession) {
      navigate('/', { replace: true })
    }
  }, [hasSession, isReady, navigate])

  // 如果认证状态未就绪，显示加载状态
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }

  // 如果未登录，不渲染子组件（即将跳转）
  if (!hasSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }

  // 已登录，渲染子组件
  return <>{children}</>
}

export default ProtectedRoute
