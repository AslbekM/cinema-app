import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as authApi from '../api/auth'

type AuthUser = authApi.CurrentUser

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  refreshUser: () => Promise<void>
  login: (nickname: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.getMe()
      setUser(data.isAuthenticated ? data : null)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [refreshUser])

  const login = async (nickname: string, password: string) => {
    const data = await authApi.login(nickname, password)
    setUser(data)
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
