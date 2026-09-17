// sign-up form + validation

// TODO: implement
import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/auth-layout'
import { SignupForm } from '../components/signup-form'

export function SignupPage() {
  return (
    <AuthLayout
      title="Create Account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-primary underline">
            Log In
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  )
}
