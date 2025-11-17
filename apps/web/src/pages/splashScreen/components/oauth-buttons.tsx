import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { GitHubIcon } from '@/components/ui/github-icon'
import { GoogleIcon } from '@/components/ui/google-icon'

interface OAuthButtonProps extends Omit<ComponentProps<typeof Button>, 'variant' | 'type'> {
  children: React.ReactNode
}

export function GoogleButton({ children, onClick, disabled, ...props }: OAuthButtonProps) {
  return (
    <Button
      variant="outline"
      type="button"
      className="h-11 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-300 dark:border-gray-700"
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <GoogleIcon />
      {children}
    </Button>
  )
}

export function GitHubButton({ children, onClick, disabled, ...props }: OAuthButtonProps) {
  return (
    <Button
      variant="outline"
      type="button"
      className="h-11 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-300 dark:border-gray-700"
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <GitHubIcon />
      {children}
    </Button>
  )
}
