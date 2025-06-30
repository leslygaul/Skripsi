"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string | number
  name: string
  email: string
  role?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
  })

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setState({ user, isLoading: false })
      } catch {
        localStorage.removeItem("auth_user")
        setState({ user: null, isLoading: false })
      }
    } else {
      setState({ user: null, isLoading: false })
    }
  }, [])

  const login = (user: User) => {
    setState({ user, isLoading: false })
    localStorage.setItem("auth_user", JSON.stringify(user))
  }

  const logout = () => {
    setState({ user: null, isLoading: false })
    localStorage.removeItem("auth_user")
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
