const MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Incorrect email or password.',
  'User already registered': 'This email has already been registered.',
  'Password should be at least 8 characters': 'Password is too short.',
  'New password should be different from the old password':
    'The new password must be different from the old password.',
  'Auth session missing!': 'The link has expired; please request it again.',
  'For security purposes, you can only request this after 60 seconds':
    'Please wait 60 seconds before trying again.',
}

export function showError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error)
  return MESSAGES[raw] ?? 'An error occurred; please try again.'
}
