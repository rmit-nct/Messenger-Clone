import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { FormField } from '@/shared/ui/forms/form-field'
import { PasswordInput } from '@/shared/ui/forms/password-input'
import { useAuth } from '@/auth/context/auth-context'
import { signupSchema, type SignupInput } from '../schemas/auth-schemas'
import { showError } from '../utils/auth-error'

function getStrength(value: string): { label: string; level: 0 | 1 | 2 | 3 } {
  if (!value) return { label: '', level: 0 }
  if (value.length < 8) return { label: 'Weak', level: 1 }
  if (value.length < 12) return { label: 'Medium', level: 2 }
  return { label: 'Strong', level: 3 }
}

export function SignupForm() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) })

  const passwordValue = useWatch({ control, name: 'password' }) ?? ''
  const strength = getStrength(passwordValue)

  async function onSubmit(values: SignupInput) {
    setServerError(null)
    try {
      await signUp(values.email, values.password)
      navigate('/setup-profile', { replace: true })
    } catch (err) {
      setServerError(showError(err))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div aria-live="assertive">
        {serverError && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
      </div>

      <FormField id="signup-email" label="Email" error={errors.email?.message}>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="ban@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'signup-email-error' : undefined}
          {...register('email')}
        />
      </FormField>

      <FormField
        id="signup-password"
        label="Password"
        error={errors.password?.message}
        hint={
          strength.level > 0 ? (
            <div className="flex items-center gap-2">
              <div className="bg-muted h-1 flex-1 overflow-hidden rounded-full">
                <div
                  className={
                    strength.level === 1
                      ? 'bg-destructive h-full w-1/3'
                      : strength.level === 2
                        ? 'bg-secondary h-full w-2/3'
                        : 'bg-primary h-full w-full'
                  }
                />
              </div>
              <span className="text-muted-foreground text-xs">Strength: {strength.label}</span>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">Minimum of 8 characters</p>
          )
        }
      >
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'signup-password-error' : 'signup-password-hint'}
          {...register('password')}
        />
      </FormField>

      <FormField
        id="signup-confirm"
        label="Confirm password"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id="signup-confirm"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'signup-confirm-error' : undefined}
          {...register('confirmPassword')}
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  )
}
