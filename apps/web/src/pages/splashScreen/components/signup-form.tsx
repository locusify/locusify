import type { SignupFormValues } from '@/lib/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
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
  /** Loading state */
  const [loading, setLoading] = useState(false)
  /** Error state */
  const [error, setError] = useState<string | null>(null)
  /** Success message state */
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  /** OAuth login hook */
  const { signInWithProvider, loading: oauthLoading } = useOAuthLogin()

  /**
   * @description The signup form
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
   * @description Register user
   * @param values - The form values
   */
  const registerUser = async (values: SignupFormValues) => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Sign up with email and password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      })

      if (signUpError)
        throw signUpError

      // Email confirmation is always required for signup
      if (data.user) {
        // Check if identities exist (email is verified)
        const hasIdentities = data.user.identities && data.user.identities.length > 0

        if (!hasIdentities) {
          console.log('User exists but email not verified. Resending verification email...')
          // User exists but email not verified, resend verification email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: values.email,
          })

          if (resendError) {
            console.error('Error resending verification email:', resendError)
            throw new Error('Account exists but email not verified. Failed to resend verification email.')
          }
        }

        // Show email verification message
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
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="password"
                    disabled={isFormDisabled}
                    {...field}
                  />
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
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="confirm-password"
                    disabled={isFormDisabled}
                    {...field}
                  />
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
