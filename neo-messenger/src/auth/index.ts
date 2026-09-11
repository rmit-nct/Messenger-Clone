// auth public barrel — cross-feature imports go through this

// TODO: implement

// ===== dev A: service, context, guards =====
// export { AuthProvider, useAuth } from './context/auth-context'
// export { RequireAuth } from './guards/require-auth'
// export { GuestOnly } from './guards/guest-only'

// ===== dev B: pages =====
export { LandingPage } from './pages/landing-page'
export { LoginPage } from './pages/login-page'
export { SignupPage } from './pages/signup-page'
export { RecoverPage } from './pages/recover-page'
export { ResetPasswordPage } from './pages/reset-password-page'
// Auth public barrel
export { AuthProvider } from './context/auth-context'
export { useAuth, type AuthContextValue } from './context/auth-context-core'
export { RequireAuth } from './guards/require-auth'
export { GuestOnly } from './guards/guest-only'
export * as authService from './service/auth-service'
