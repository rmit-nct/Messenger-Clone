// Typed VITE_* env access. Values must exist in neo-messenger/.env (never commit real keys).
// .env.example documents the shape.
function requireEnv(name: string): string {
  const val = import.meta.env[name]
  if (!val) {
    // Fail loudly at runtime with a clear message; does not crash typecheck.
    throw new Error(`Missing env var ${name} — set it in neo-messenger/.env`)
  }
  return String(val)
}

export const env = {
  supabaseUrl: requireEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('VITE_SUPABASE_ANON_KEY'),
} as const