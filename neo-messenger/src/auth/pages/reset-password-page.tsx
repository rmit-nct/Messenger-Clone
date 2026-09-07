// set new password from token link

// TODO: implement
import { AuthLayout } from '../components/auth-layout'
import { ResetPasswordForm } from '../components/reset-password-form'

export function ResetPasswordPage() {
  return (
    <AuthLayout title="New password">
      <ResetPasswordForm />
    </AuthLayout>
  )
}
