// sign-in form, no account enumeration

// TODO: implement

// src/auth/pages/login-page.tsx
import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/auth-layout'
import { LoginForm } from '../components/login-form'

export function LoginPage() {
  return (
    <AuthLayout
      title="Log In"
      footer={
        <>
          Don't have an account yet?{' '}
          <Link to="/signup" className="underline">
            Sign Up
          </Link>
        </>
      }
    >
      <LoginForm />
      <Link to="/recover" className="text-muted-foreground mt-4 block text-sm underline">
        Forgot password?
      </Link>
    </AuthLayout>
  )
}
