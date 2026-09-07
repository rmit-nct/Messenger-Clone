// session provider + useAuth hook

// TODO: implement

export function useAuth() {
  return {
    user: null,
    loading: false,
    signUp: async (email: string, _password: string) => {
      await new Promise((r) => setTimeout(r, 800))
      if (email === 'taken@test.com') throw new Error('User already registered')
    },
    signIn: async (_email: string, password: string) => {
      await new Promise((r) => setTimeout(r, 800))
      if (password !== 'Test123456!') throw new Error('Invalid login credentials')
    },
    signOut: async () => {},
    recoverPassword: async (_email: string) => {
      await new Promise((r) => setTimeout(r, 800))
    },
    updatePassword: async (_newPassword: string) => {
      await new Promise((r) => setTimeout(r, 800))
    },
  }
}