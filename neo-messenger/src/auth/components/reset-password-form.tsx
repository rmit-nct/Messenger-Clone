import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { FormField } from '@/shared/ui/forms/form-field'
import { PasswordInput } from '@/shared/ui/forms/password-input'
import { useAuth } from '@/auth/context/auth-context'
import { resetPasswordSchema, type ResetPasswordInput } from '../schemas/auth-schemas'
import { showError } from '../utils/auth-error'

export function ResetPasswordForm() {
  const { updatePassword } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [linkInvalid, setLinkInvalid] = useState(false)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) })

  useEffect(() => {
    setFocus('password')
  }, [setFocus])

  async function onSubmit(values: ResetPasswordInput) {
    setServerError(null)
    try {
      await updatePassword(values.password)
      setDone(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      // Session thiếu = người dùng vào thẳng URL hoặc link đã hết hạn
      if (message.includes('session') || message.includes('Auth session missing')) {
        setLinkInvalid(true)
      } else {
        setServerError(showError(err))
      }
    }
  }

  if (done) {
    return (
      <div className="space-y-4" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="text-primary size-10" aria-hidden="true" />
          <p className="text-sm">Password</p>
        </div>
        <Button render={<Link to="/login" />} className="w-full">
          <Link to="/login">Log In</Link>
        </Button>
      </div>
    )
  }

  if (linkInvalid) {
    return (
      <div className="space-y-4" role="alert" aria-live="assertive">
        <Alert variant="destructive">
          <AlertDescription>The link has expired or is invalid.</AlertDescription>
        </Alert>
        <Button render={<Link to="/recover" />} className="w-full">
          <Link to="/recover">Request a new link</Link>
        </Button>
      </div>
    )
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

      <p className="text-muted-foreground text-sm">Enter a new password for your account.</p>

      <FormField
        id="reset-password"
        label="New password"
        error={errors.password?.message}
        hint={<p className="text-muted-foreground text-xs">Minimum of 8 characters</p>}
      >
        <PasswordInput
          id="reset-password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'reset-password-error' : 'reset-password-hint'}
          {...register('password')}
        />
      </FormField>

      <FormField
        id="reset-confirm"
        label="Confirm new password"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id="reset-confirm"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'reset-confirm-error' : undefined}
          {...register('confirmPassword')}
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? 'Updating...' : 'Update password'}
      </Button>
    </form>
  )
}
