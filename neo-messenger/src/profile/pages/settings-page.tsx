import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '../../shared/ui/button'
import { Input } from '../../shared/ui/input'
import { cn } from '../../shared/lib/utils'
import { useAuth } from '@/auth'
import { useTextSize, useTheme, type TextSize, type Theme } from '../../app'

interface Option<T extends string> {
  value: T
  label: string
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm transition-colors',
            value === option.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground hover:bg-foreground/10',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { textSize, setTextSize } = useTextSize()
  const { updatePassword, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSaved, setPwSaved] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function submitPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPwError(null)
    setPwSaved(false)
    if (newPassword.length < 8) {
      setPwError('Password must have at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.')
      return
    }
    setPwBusy(true)
    try {
      await updatePassword(newPassword)
      setPwSaved(true)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Could not update password')
    } finally {
      setPwBusy(false)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      queryClient.clear()
      navigate('/', { replace: true })
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4">
      <h1 className="text-lg font-bold text-foreground">Settings</h1>

      <section className="space-y-3 rounded-lg border border-border bg-panel p-4">
        <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Theme</p>
          <Segmented<Theme>
            label="Theme"
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Text size</p>
          <Segmented<TextSize>
            label="Text size"
            value={textSize}
            onChange={setTextSize}
            options={[
              { value: 'sm', label: 'Small' },
              { value: 'default', label: 'Default' },
              { value: 'lg', label: 'Large' },
            ]}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-panel p-4">
        <h2 className="text-sm font-semibold text-foreground">Account</h2>
        <form onSubmit={submitPassword} className="space-y-2" noValidate>
          <p className="text-xs text-muted-foreground">Change password</p>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            aria-label="New password"
          />
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-label="Confirm new password"
          />
          {pwError && (
            <p role="alert" className="text-xs text-destructive">
              {pwError}
            </p>
          )}
          {pwSaved && (
            <p role="status" className="text-xs text-cyan-strong dark:text-cyan">
              Password updated.
            </p>
          )}
          <Button type="submit" disabled={pwBusy}>
            {pwBusy ? 'Updating…' : 'Update password'}
          </Button>
        </form>
        <Button variant="destructive" onClick={() => void handleSignOut()} disabled={signingOut}>
          {signingOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </section>
    </div>
  )
}
