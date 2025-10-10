import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import supabase from '@/lib/supabase'
import { cn } from '@/lib/utils'

export interface SignupFormProps extends React.ComponentProps<'form'> {
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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/\d/.test(pwd)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  const registerUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    try {
      // Sign up with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error)
        throw error

      // Email confirmation is always required for signup
      if (data.user) {
        // Check if identities exist (email is verified)
        if (data.user.identities && data.user.identities.length === 0) {
          console.log('User exists but email not verified. Resending verification email...')
          // User exists but email not verified, resend verification email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email,
          })

          if (resendError) {
            console.error('Error resending verification email:', resendError)
            throw new Error('Account exists but email not verified. Failed to resend verification email.')
          }
        }

        // Show email verification message
        console.log('Email verification required. Confirmation email sent to:', email)
        // Signup successful - user needs to verify email via the link sent
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

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      })

      if (error)
        throw error
    }
    catch (err) {
      console.error('Google signup error:', err)
      setError(err instanceof Error ? err.message : 'Google signup failed')
      setLoading(false)
    }
  }

  const handleGitHubSignup = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
      })

      if (error)
        throw error
    }
    catch (err) {
      console.error('GitHub signup error:', err)
      setError(err instanceof Error ? err.message : 'GitHub signup failed')
      setLoading(false)
    }
  }

  return (
    <form className={cn('flex flex-col gap-6', className)} onSubmit={registerUser} {...props}>
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

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <FieldDescription>
            At least 8 characters with uppercase, lowercase, and numbers
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />
        </Field>

        <Field>
          <Button type="submit" disabled={loading} className="text-white">
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            className="hover:bg-transparent"
            onClick={handleGoogleSignup}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </Button>
        </Field>

        <Field>
          <Button
            variant="outline"
            type="button"
            className="hover:bg-transparent"
            onClick={handleGitHubSignup}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Sign up with GitHub
          </Button>

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
        </Field>
      </FieldGroup>
    </form>
  )
}
