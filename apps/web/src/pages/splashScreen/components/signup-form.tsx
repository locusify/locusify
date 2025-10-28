import type { SignupFormValues } from '@/lib/validations/auth'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useOAuthLogin } from '@/hooks/useOAuthLogin'
import supabase from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { signupSchema } from '@/lib/validations/auth'
import { GitHubButton, GoogleButton } from './oauth-buttons'

export interface SignupFormProps extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
  showTitle?: boolean
}

export function SignupForm({
  className,
  onSuccess,
  onSwitchToLogin,
  showTitle = true,
  ...props
}: SignupFormProps) {
  /** 加载状态 */
  const [loading, setLoading] = useState(false)
  /** 错误状态 */
  const [error, setError] = useState<string | null>(null)
  /** 成功消息状态 */
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  /** 密码可见性状态 */
  const [showPassword, setShowPassword] = useState(false)
  /** 确认密码可见性状态 */
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  /** OAuth 登录钩子 */
  const { signInWithProvider, loading: oauthLoading } = useOAuthLogin()

  /**
   * 注册表单
   */
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  /**
   * 用户注册函数
   * @param values - 表单值
   */
  const registerUser = async (values: SignupFormValues) => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      /** 使用邮箱和密码注册 */
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      })

      if (signUpError)
        throw signUpError

      /** 注册总是需要邮箱验证 */
      if (data.user) {
        /** 检查身份是否存在（邮箱已验证） */
        const hasIdentities = data.user.identities && data.user.identities.length > 0

        if (!hasIdentities) {
          console.log('User exists but email not verified. Resending verification email...')
          /** 用户存在但邮箱未验证，重新发送验证邮件 */
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: values.email,
          })

          if (resendError) {
            console.error('Error resending verification email:', resendError)
            throw new Error('Account exists but email not verified. Failed to resend verification email.')
          }
        }

        /** 显示邮箱验证消息 */
        const message = `Verification email sent to ${values.email}. Please check your inbox and verify your email to continue.`
        console.log('Email verification required:', message)
        setSuccessMessage(message)

        onSuccess?.()
      }
      else {
        throw new Error('Unexpected signup response: no user created')
      }
    }
    catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.')
    }
    finally {
      setLoading(false)
    }
  }

  const isFormDisabled = loading || oauthLoading

  return (
    <Form {...form}>
      <form className={cn('flex flex-col gap-6', className)} onSubmit={form.handleSubmit(registerUser)} {...props}>
        <FieldGroup>
          {showTitle && (
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-bold">Create an account</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Enter your information to get started
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 p-3 rounded-md text-sm border border-green-200 dark:border-green-800">
              {successMessage}
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
                    autoComplete="email"
                    placeholder="example@example.com"
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
                <FormDescription>
                  At least 8 characters with uppercase, lowercase, and numbers
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="confirm-password"
                      disabled={isFormDisabled}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isFormDisabled}
                    >
                      {showConfirmPassword
                        ? (
                            <EyeOff className="h-4 w-4" />
                          )
                        : (
                            <Eye className="h-4 w-4" />
                          )}
                      <span className="sr-only">
                        {showConfirmPassword ? 'Hide password' : 'Show password'}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isFormDisabled} className="text-white">
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>

          <FieldSeparator>Or continue with</FieldSeparator>

          <GoogleButton
            onClick={() => signInWithProvider('google')}
            disabled={isFormDisabled}
          >
            Sign up with Google
          </GoogleButton>

          <GitHubButton
            onClick={() => signInWithProvider('github')}
            disabled={isFormDisabled}
          >
            Sign up with GitHub
          </GitHubButton>

          <FieldDescription className="text-center">
            Already have an account?
            {' '}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={(e) => {
                e.preventDefault()
                onSwitchToLogin?.()
              }}
            >
              Sign in
            </Button>
          </FieldDescription>
        </FieldGroup>
      </form>
    </Form>
  )
}
