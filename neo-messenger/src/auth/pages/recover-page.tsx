// password reset request

// TODO: implement
import { AuthLayout } from '../components/auth-layout'
import { RecoverForm } from '../components/recover-form'

export function RecoverPage() {
  return (
    <AuthLayout title="Reset password">
      <RecoverForm />
    </AuthLayout>
  )
}
