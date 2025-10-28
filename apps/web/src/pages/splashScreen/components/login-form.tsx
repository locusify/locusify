import type { LoginFormValues } from '@/lib/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from '@/components/ui/field'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useOAuthLogin } from '@/hooks/useOAuthLogin'
import supabase from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { loginSchema } from '@/lib/validations/auth'
import { GitHubButton, GoogleButton } from './oauth-buttons'

export interface LoginFormProps extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  onSuccess?: () => void
  onSwitchToSignup?: () => void
  showTitle?: boolean
}

export function LoginForm({
  className,
  onSuccess,
  onSwitchToSignup,
  showTitle = true,
  ...props
}: LoginFormProps) {
  /** 加载状态 */
  const [loading, setLoading] = useState(false)
  /** 错误状态 */
  const [error, setError] = useState<string | null>(null)
  /** 密码可见性状态 */
  const [showPassword, setShowPassword] = useState(false)

  /** OAuth 登录钩子 */
  const { signInWithProvider, loading: oauthLoading } = useOAuthLogin()

  /**
   * 登录表单
   */
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  /**
   * 处理登录表单提交
   * @param values - 表单值
   */
  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (authError)
        throw authError

      console.log('Login successful!')
      onSuccess?.()
    }
    catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.')
    }
    finally {
      setLoading(false)
    }
  }

  /** 表单是否被禁用 */
  const isFormDisabled = loading || oauthLoading

  return (
    <Form {...form}>
      <form className={cn('flex flex-col gap-6', className)} onSubmit={form.handleSubmit(handleLogin)} {...props}>
        <FieldGroup>
          {showTitle && (
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-bold">Login to your account</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Enter your email below to login to your account
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@example.com"
                    autoComplete="email"
                    disabled={isFormDisabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="password"
                      disabled={isFormDisabled}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isFormDisabled}
                    >
                      {showPassword
                        ? (
                            <EyeOff className="size-4" />
                          )
                        : (
                            <Eye className="size-4" />
                          )}
                      <span className="sr-only">
                        {showPassword ? 'Hide password' : 'Show password'}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isFormDisabled} className="text-white">
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <FieldSeparator>Or continue with</FieldSeparator>

          <GoogleButton
            onClick={() => signInWithProvider('google')}
            disabled={isFormDisabled}
          >
            Login with Google
          </GoogleButton>

          <GitHubButton
            onClick={() => signInWithProvider('github')}
            disabled={isFormDisabled}
          >
            Login with GitHub
          </GitHubButton>

          <FieldDescription className="text-center">
            Don&apos;t have an account?
            {' '}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={(e) => {
                e.preventDefault()
                onSwitchToSignup?.()
              }}
            >
              Sign up
            </Button>
          </FieldDescription>
        </FieldGroup>
      </form>
    </Form>
  )
}
