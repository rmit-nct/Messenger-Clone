import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { FormField } from '@/shared/ui/forms/form-field'
import { useAuth } from '@/auth/context/auth-context-core'
import { recoverSchema, type RecoverInput } from '../schemas/auth-schemas'
import { showError } from '../utils/auth-error'

export function RecoverForm() {
  const { resetPassword } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoverInput>({ resolver: zodResolver(recoverSchema) })

  async function onSubmit(values: RecoverInput) {
    setServerError(null)
    try {
      await resetPassword(values.email)
      setSent(true)
    } catch (err) {
      setServerError(showError(err))
    }
  }

  if (sent) {
    return (
      <div className="space-y-4" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <MailCheck className="text-primary size-10" aria-hidden="true" />
          <p className="text-sm">
            If this email is registered, we have sent a password recovery link. Please check your
            inbox.
          </p>
        </div>
        <Button render={<Link to="/login" />} variant="outline" className="w-full">
          <Link to="/login">Return to login</Link>
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

      <p className="text-muted-foreground text-sm">
        Enter your email, and we will send you a link to reset your password.
      </p>

      <FormField id="recover-email" label="Email" error={errors.email?.message}>
        <Input
          id="recover-email"
          type="email"
          autoComplete="email"
          placeholder="ban@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'recover-email-error' : undefined}
          {...register('email')}
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? 'Sending...' : 'Send verification email'}
      </Button>

      <Button render={<Link to="/login" />} variant="ghost" className="w-full">
        <Link to="/login">Return to login</Link>
      </Button>
    </form>
  )
}
