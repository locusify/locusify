import type { LucideIcon } from 'lucide-react'
import type { FC } from 'react'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SettingsDrawer } from '@/pages/settings'

interface NavItem {
  id: string
  icon?: LucideIcon
  label: string
  path: string
  isAction?: boolean
  isSettings?: boolean
}

const Navbar: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: t('navbar.home', { defaultValue: '首页' }),
      path: '/explore',
    },
    {
      id: 'workspace',
      icon: Plus,
      label: t('navbar.workspace', { defaultValue: '工作区' }),
      path: '/workspace',
      isAction: true,
    },
    {
      id: 'profile',
      label: t('navbar.profile', { defaultValue: '我的' }),
      path: '/profile',
      isSettings: true,
    },
  ]

  const handleNavClick = (item: NavItem) => {
    if (item.isSettings) {
      setSettingsOpen(true)
      return
    }
    navigate(item.path)
  }

  const isActive = (item: NavItem) => {
    if (item.isSettings) {
      return settingsOpen
    }
    if (item.path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(item.path)
  }

  return (
    <>
      <nav className="z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-12 px-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)

            // Floating action button (FAB)
            if (item.isAction) {
              return (
                <div key={item.id} className="relative flex-1 flex justify-center">
                  <Button
                    variant="default"
                    size="icon-lg"
                    onClick={() => handleNavClick(item)}
                    className={cn(
                      'absolute -top-8 size-10 rounded-full shadow-lg',
                      'bg-red-500 hover:bg-red-600 active:scale-95',
                      'transition-all duration-200',
                    )}
                    aria-label={item.label}
                  >
                    {Icon && <Icon className="size-6 text-white" strokeWidth={2.5} />}
                  </Button>
                </div>
              )
            }

            // Regular navigation buttons (text only)
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="lg"
                onClick={() => handleNavClick(item)}
                className={cn(
                  'flex-1 flex items-center justify-center h-full rounded-none',
                  'hover:bg-gray-50 transition-colors',
                )}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'text-base transition-colors',
                    active ? 'text-gray-900 font-semibold' : 'text-gray-400 font-normal',
                  )}
                >
                  {item.label}
                </span>
              </Button>
            )
          })}
        </div>
      </nav>
      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}

export default Navbar
